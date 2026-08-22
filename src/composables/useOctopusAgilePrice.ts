import { ref, computed } from 'vue'
import type { AgileRegionCode } from '../constants/defaults'

// The Octopus Agile product code changes every so often when Octopus rolls
// out a new tariff version (roughly annually). This is the code current as
// of August 2026. fetchFreshRate() below will automatically discover the
// live product code instead of failing outright if this one is retired,
// so this constant shouldn't need manual upkeep.
const FALLBACK_PRODUCT_CODE = 'AGILE-24-10-01'

const CACHE_KEY = 'octopus_agile_price_cache_v1'

interface AgileCache {
  value: number
  validFrom: string
  validTo: string
  fetchedAt: string
  productCode: string
  regionCode: AgileRegionCode
}

function getHalfHourWindow(date: Date): { from: Date; to: Date } {
  const from = new Date(date)
  from.setSeconds(0, 0)
  from.setMinutes(date.getMinutes() < 30 ? 0 : 30)
  const to = new Date(from)
  to.setMinutes(from.getMinutes() + 30)
  return { from, to }
}

function readCache(): AgileCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as AgileCache) : null
  } catch {
    return null
  }
}

function writeCache(cache: AgileCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.error('Failed to cache Agile price', e)
  }
}

// The cached rate is only "fresh" while `now` falls inside the half-hour
// slot it was issued for. Once that slot ends, we need a new API call.
function isCacheValid(cache: AgileCache | null, now: Date): boolean {
  if (!cache) return false
  return now >= new Date(cache.validFrom) && now < new Date(cache.validTo)
}

async function discoverCurrentAgileProductCode(): Promise<string> {
  const res = await fetch(
    'https://api.octopus.energy/v1/products/?brand=OCTOPUS_ENERGY&is_variable=true'
  )
  if (!res.ok) throw new Error(`Product lookup failed (${res.status})`)
  const data = await res.json()
  const agileProduct = (data.results || []).find(
    (p: { code: string; direction?: string }) =>
      p.code.startsWith('AGILE-') && p.direction !== 'EXPORT'
  )
  if (!agileProduct) throw new Error('Could not find a live Agile product')
  return agileProduct.code as string
}

async function fetchRateForProductCode(
  productCode: string,
  regionCode: AgileRegionCode,
  from: Date,
  to: Date
): Promise<AgileCache> {
  const tariffCode = `E-1R-${productCode}-${regionCode}`
  const url =
    `https://api.octopus.energy/v1/products/${productCode}/electricity-tariffs/` +
    `${tariffCode}/standard-unit-rates/?period_from=${from.toISOString()}&period_to=${to.toISOString()}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Octopus API returned ${res.status}`)
  const data = await res.json()
  const rate = data.results?.[0]
  if (!rate) throw new Error('No Agile rate returned for the current period')

  return {
    value: rate.value_inc_vat,
    validFrom: rate.valid_from,
    validTo: rate.valid_to,
    fetchedAt: new Date().toISOString(),
    productCode,
    regionCode
  }
}

async function fetchFreshRate(regionCode: AgileRegionCode): Promise<AgileCache> {
  const now = new Date()
  const { from, to } = getHalfHourWindow(now)
  const lastKnownProductCode = readCache()?.productCode || FALLBACK_PRODUCT_CODE

  try {
    return await fetchRateForProductCode(lastKnownProductCode, regionCode, from, to)
  } catch (e) {
    // The cached/fallback product code may have been retired. Fall back to
    // discovering whichever Agile product is live right now and retry once.
    const currentProductCode = await discoverCurrentAgileProductCode()
    if (currentProductCode === lastKnownProductCode) throw e
    return await fetchRateForProductCode(currentProductCode, regionCode, from, to)
  }
}

export function useOctopusAgilePrice() {
  const agilePrice = ref<number | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<string | null>(null)

  /**
   * Ensures `agilePrice` reflects the current half-hour slot for the given region.
   * Only fetches if a region is provided. Reads from localStorage first and only
   * hits the Octopus API when the cached slot has expired (or there's no cache yet),
   * so repeated calls within the same half hour never trigger a network request.
   */
  async function ensureFreshPrice(regionCode: AgileRegionCode | null): Promise<void> {
    // If no region is set, clear the price and don't fetch
    if (!regionCode) {
      agilePrice.value = null
      error.value = null
      lastUpdated.value = null
      return
    }

    const now = new Date()
    const cache = readCache()

    // If cache is valid for the current region, use it
    if (isCacheValid(cache, now) && cache?.regionCode === regionCode) {
      agilePrice.value = cache.value
      lastUpdated.value = cache.fetchedAt
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const fresh = await fetchFreshRate(regionCode)
      writeCache(fresh)
      agilePrice.value = fresh.value
      lastUpdated.value = fresh.fetchedAt
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch the Agile price'
      // A stale cached value is still more useful than nothing.
      if (cache && cache.regionCode === regionCode) {
        agilePrice.value = cache.value
        lastUpdated.value = cache.fetchedAt
      } else {
        agilePrice.value = null
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    agilePrice,
    isLoading,
    error,
    lastUpdated,
    ensureFreshPrice
  }
}
