import { ref, watch } from 'vue'
import {
  DEFAULT_EV_RATE,
  DEFAULT_EV_EFFICIENCY,
  DEFAULT_PETROL_MPG,
  DEFAULT_SHAKE_THRESHOLD,
  DEFAULT_SHAKE_ENABLED,
  DEFAULT_BATTERY_CAPACITY,
  DEFAULT_CURRENT_SOC,
  DEFAULT_TARGET_SOC,
  DEFAULT_AGILE_REGION,
  type AgileRegionCode
} from '../constants/defaults'

const STORAGE_KEYS = {
  evRate: 'ev_rate',
  evEfficiency: 'ev_efficiency',
  petrolMpg: 'petrol_mpg',
  shakeThreshold: 'shake_threshold',
  shakeEnabled: 'shake_enabled',
  batteryCapacity: 'battery_capacity',
  currentSoc: 'current_soc',
  targetSoc: 'target_soc',
  agileRegion: 'agile_region'
} as const

export function usePersistedSettings() {
  const evRate = ref<number>(DEFAULT_EV_RATE)
  const evEfficiency = ref<number>(DEFAULT_EV_EFFICIENCY)
  const petrolMpg = ref<number>(DEFAULT_PETROL_MPG)
  const shakeThreshold = ref<number>(DEFAULT_SHAKE_THRESHOLD)
  const shakeEnabled = ref<boolean>(DEFAULT_SHAKE_ENABLED)
  const batteryCapacity = ref<number>(DEFAULT_BATTERY_CAPACITY)
  const currentSoc = ref<number>(DEFAULT_CURRENT_SOC)
  const targetSoc = ref<number>(DEFAULT_TARGET_SOC)
  const agileRegion = ref<AgileRegionCode | null>(DEFAULT_AGILE_REGION)

  function loadFromStorage() {
    const savedEvRate = localStorage.getItem(STORAGE_KEYS.evRate)
    const savedEvEfficiency = localStorage.getItem(STORAGE_KEYS.evEfficiency)
    const savedPetrolMpg = localStorage.getItem(STORAGE_KEYS.petrolMpg)
    const savedShakeThreshold = localStorage.getItem(STORAGE_KEYS.shakeThreshold)
    const savedShakeEnabled = localStorage.getItem(STORAGE_KEYS.shakeEnabled)
    const savedBatteryCapacity = localStorage.getItem(STORAGE_KEYS.batteryCapacity)
    const savedCurrentSoc = localStorage.getItem(STORAGE_KEYS.currentSoc)
    const savedTargetSoc = localStorage.getItem(STORAGE_KEYS.targetSoc)
    const savedAgileRegion = localStorage.getItem(STORAGE_KEYS.agileRegion)

    if (savedEvRate !== null) evRate.value = parseFloat(savedEvRate)
    if (savedEvEfficiency !== null) evEfficiency.value = parseFloat(savedEvEfficiency)
    if (savedPetrolMpg !== null) petrolMpg.value = parseFloat(savedPetrolMpg)
    if (savedShakeThreshold !== null) shakeThreshold.value = parseInt(savedShakeThreshold, 10)
    if (savedShakeEnabled !== null) shakeEnabled.value = savedShakeEnabled === 'true'
    if (savedBatteryCapacity !== null) batteryCapacity.value = parseFloat(savedBatteryCapacity)
    if (savedCurrentSoc !== null) currentSoc.value = parseFloat(savedCurrentSoc)
    if (savedTargetSoc !== null) targetSoc.value = parseFloat(savedTargetSoc)
    if (savedAgileRegion !== null) agileRegion.value = savedAgileRegion as AgileRegionCode
  }

  function persistToStorage() {
    localStorage.setItem(STORAGE_KEYS.evRate, evRate.value.toString())
    localStorage.setItem(STORAGE_KEYS.evEfficiency, evEfficiency.value.toString())
    localStorage.setItem(STORAGE_KEYS.petrolMpg, petrolMpg.value.toString())
    localStorage.setItem(STORAGE_KEYS.shakeThreshold, shakeThreshold.value.toString())
    localStorage.setItem(STORAGE_KEYS.shakeEnabled, shakeEnabled.value.toString())
    localStorage.setItem(STORAGE_KEYS.batteryCapacity, batteryCapacity.value.toString())
    localStorage.setItem(STORAGE_KEYS.currentSoc, currentSoc.value.toString())
    localStorage.setItem(STORAGE_KEYS.targetSoc, targetSoc.value.toString())
    if (agileRegion.value) {
      localStorage.setItem(STORAGE_KEYS.agileRegion, agileRegion.value)
    } else {
      localStorage.removeItem(STORAGE_KEYS.agileRegion)
    }
  }

  function resetToDefaults() {
    evRate.value = DEFAULT_EV_RATE
    evEfficiency.value = DEFAULT_EV_EFFICIENCY
    petrolMpg.value = DEFAULT_PETROL_MPG
    shakeThreshold.value = DEFAULT_SHAKE_THRESHOLD
    shakeEnabled.value = DEFAULT_SHAKE_ENABLED
    batteryCapacity.value = DEFAULT_BATTERY_CAPACITY
    currentSoc.value = DEFAULT_CURRENT_SOC
    targetSoc.value = DEFAULT_TARGET_SOC
    agileRegion.value = DEFAULT_AGILE_REGION
    // Matches the original app's behaviour: wipes everything in localStorage,
    // including the cached Agile price. It'll simply be refetched next time
    // ensureFreshPrice() runs.
    localStorage.clear()
  }

  loadFromStorage()

  watch(
    [evRate, evEfficiency, petrolMpg, shakeThreshold, shakeEnabled, batteryCapacity, currentSoc, targetSoc, agileRegion],
    persistToStorage
  )

  return {
    evRate,
    evEfficiency,
    petrolMpg,
    shakeThreshold,
    shakeEnabled,
    batteryCapacity,
    currentSoc,
    targetSoc,
    agileRegion,
    resetToDefaults
  }
}
