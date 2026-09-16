<script setup lang="ts">
import type { ChargeDetails } from '../composables/useCostCalculations'

const batteryCapacity = defineModel<number>('batteryCapacity', { required: true })
const currentSoc = defineModel<number>('currentSoc', { required: true })
const targetSoc = defineModel<number>('targetSoc', { required: true })

defineProps<{
  chargeDetails: ChargeDetails
}>()
</script>

<template>
  <div class="field mb-4" data-label="session-estimator-group">
    <label class="label is-size-6 mb-2">Charging Session Estimator</label>
    <div class="columns is-mobile mb-2">
      <div class="column">
        <label class="label is-size-7 mb-1">Battery (kWh)</label>
        <input
          class="input is-small custom-input"
          type="number"
          step="5"
          min="10"
          max="150"
          v-model.number="batteryCapacity"
          data-label="battery-capacity-input"
        />
      </div>
      <div class="column">
        <label class="label is-size-7 mb-1">Current %</label>
        <input
          class="input is-small custom-input"
          type="number"
          step="5"
          min="0"
          max="95"
          v-model.number="currentSoc"
          data-label="current-soc-input"
        />
      </div>
      <div class="column">
        <label class="label is-size-7 mb-1">Target %</label>
        <input
          class="input is-small custom-input"
          type="number"
          step="5"
          min="5"
          max="100"
          v-model.number="targetSoc"
          data-label="target-soc-input"
        />
      </div>
    </div>
    <div class="is-size-7 p-2 custom-estimator-box rounded-sm" data-label="charging-session-summary">
      Adding <strong>{{ chargeDetails.kWhNeeded }} kWh</strong> ({{ targetSoc - currentSoc }}%) costs
      <strong>£{{ chargeDetails.totalCostPounds }}</strong> <br>and yields approx.
      <strong>{{ chargeDetails.rangeAdded }} miles</strong> of range.
    </div>
  </div>
</template>
