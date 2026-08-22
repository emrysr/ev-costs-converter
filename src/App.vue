<script setup lang="ts">
import { ref, watch } from 'vue'
import './assets/app.css'

import ChargerPriceControl from './components/ChargerPriceControl.vue'
import EfficiencyControl from './components/EfficiencyControl.vue'
import PetrolMpgControl from './components/PetrolMpgControl.vue'
import ChargingSessionEstimator from './components/ChargingSessionEstimator.vue'
import ResultsSummary from './components/ResultsSummary.vue'
import SettingsDialog from './components/SettingsDialog.vue'

import { usePersistedSettings } from './composables/usePersistedSettings'
import { useShakeToReset } from './composables/useShakeToReset'
import { useCostCalculations } from './composables/useCostCalculations'
import { useOctopusAgilePrice } from './composables/useOctopusAgilePrice'

const {
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
} = usePersistedSettings()

const { costPerMile, pencePerLitre, equivalentYearResult, chargeDetails } = useCostCalculations(
  evRate,
  evEfficiency,
  petrolMpg,
  batteryCapacity,
  currentSoc,
  targetSoc
)

const {
  agilePrice,
  isLoading: agileLoading,
  error: agileError,
  ensureFreshPrice
} = useOctopusAgilePrice()

const { requestMotionPermission } = useShakeToReset(shakeEnabled, shakeThreshold, resetToDefaults)

const settingsDialog = ref<InstanceType<typeof SettingsDialog> | null>(null)

function openSettings() {
  if ('DeviceMotionEvent' in window) {
    requestMotionPermission()
  }
  settingsDialog.value?.open()
}

// Fetch Agile price whenever the region changes, or on initial load
watch(
  agileRegion,
  () => {
    ensureFreshPrice(agileRegion.value)
  },
  { immediate: true }
)
</script>

<template>
  <section class="section" data-label="main-section">
    <div class="container" style="max-width: 480px;" data-label="app-container">
      <div class="box" data-label="card-wrapper">
        <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
          <h1 class="title is-4 mb-0" data-label="app-header">EV COST CONVERTER</h1>
          <button
            class="button is-small is-ghost px-1 is-size-4"
            @click="openSettings"
            data-label="open-settings-button"
            aria-label="Settings"
          >
            &#9776;
          </button>
        </div>

        <ChargerPriceControl
          v-model="evRate"
          :agile-price="agilePrice"
          :agile-loading="agileLoading"
          :agile-error="agileError"
        />

        <EfficiencyControl v-model="evEfficiency" />

        <PetrolMpgControl v-model="petrolMpg" />

        <hr class="my-4" style="background-color: var(--bulma-border);" />

        <ChargingSessionEstimator
          v-model:battery-capacity="batteryCapacity"
          v-model:current-soc="currentSoc"
          v-model:target-soc="targetSoc"
          :charge-details="chargeDetails"
        />

        <ResultsSummary
          :cost-per-mile="costPerMile"
          :pence-per-litre="pencePerLitre"
          :equivalent-year="equivalentYearResult.year"
          :is-out-bounds="equivalentYearResult.isOutBounds"
        />
      </div>
    </div>

    <SettingsDialog
      ref="settingsDialog"
      v-model:shake-enabled="shakeEnabled"
      v-model:shake-threshold="shakeThreshold"
      v-model:agile-region="agileRegion"
      @reset="resetToDefaults"
    />
  </section>
</template>
