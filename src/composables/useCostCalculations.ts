import { computed, type Ref } from 'vue'
import { YEARLY_PETROL_PRICES } from '../constants/petrolPrices'

export interface EquivalentYearResult {
  year: number
  isOutBounds: boolean
}

export interface ChargeDetails {
  kWhNeeded: string
  totalCostPounds: string
  rangeAdded: string
}

export function useCostCalculations(
  evRate: Ref<number>,
  evEfficiency: Ref<number>,
  petrolMpg: Ref<number>,
  batteryCapacity: Ref<number>,
  currentSoc: Ref<number>,
  targetSoc: Ref<number>
) {
  const costPerMile = computed<string>(() => {
    if (!evEfficiency.value) return '0.00'
    return (evRate.value / evEfficiency.value).toFixed(2)
  })

  const pencePerLitre = computed<string>(() => {
    if (!evEfficiency.value) return '0.0'
    const cpm = evRate.value / evEfficiency.value
    const litresPerGallon = 4.54609
    return ((cpm * petrolMpg.value) / litresPerGallon).toFixed(1)
  })

  const equivalentYearResult = computed<EquivalentYearResult>(() => {
    const currentPence = parseFloat(pencePerLitre.value)
    const years = Object.keys(YEARLY_PETROL_PRICES).map(Number).sort((a, b) => a - b)

    const minYear = years[0]
    const maxYear = years[years.length - 1]
    const minPrice = YEARLY_PETROL_PRICES[minYear]
    const maxPrice = YEARLY_PETROL_PRICES[maxYear]

    if (currentPence <= minPrice) {
      return { year: minYear, isOutBounds: true }
    }

    if (currentPence >= maxPrice) {
      return { year: maxYear, isOutBounds: true }
    }

    const closestYear = years.reduce((closest, year) => {
      const prevDiff = Math.abs(YEARLY_PETROL_PRICES[closest] - currentPence)
      const currDiff = Math.abs(YEARLY_PETROL_PRICES[year] - currentPence)
      return currDiff < prevDiff ? year : closest
    }, years[0])

    return { year: closestYear, isOutBounds: false }
  })

  const chargeDetails = computed<ChargeDetails>(() => {
    const percentageToAdd = Math.max(0, targetSoc.value - currentSoc.value)
    const kWhNeeded = (batteryCapacity.value * percentageToAdd) / 100
    const totalCostPence = kWhNeeded * evRate.value
    const totalCostPounds = (totalCostPence / 100).toFixed(2)
    const rangeAdded = (kWhNeeded * evEfficiency.value).toFixed(0)
    return { kWhNeeded: kWhNeeded.toFixed(1), totalCostPounds, rangeAdded }
  })

  return { costPerMile, pencePerLitre, equivalentYearResult, chargeDetails }
}
