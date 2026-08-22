<script setup lang="ts">
import { PRESET_RATES, CHARGER_PRICE_RANGE, SNAP_TOLERANCE_PENCE } from '../constants/presets'

const modelValue = defineModel<number>({ required: true })

defineProps<{
  agilePrice: number | null
  agileLoading: boolean
  agileError: string | null
}>()

function handleSliderInput(event: Event) {
  const val = parseFloat((event.target as HTMLInputElement).value)
  for (const preset of PRESET_RATES) {
    if (Math.abs(val - preset.value) <= SNAP_TOLERANCE_PENCE) {
      modelValue.value = preset.value
      return
    }
  }
  modelValue.value = val
}

function markerPosition(value: number): string {
  const { min, max } = CHARGER_PRICE_RANGE
  const clamped = Math.min(max, Math.max(min, value))
  return `${((clamped - min) / (max - min)) * 100}%`
}
</script>

<template>
  <div class="field mb-5" data-label="charger-price-group">
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-1">
      <label class="label mb-0" data-label="charger-price-label">Charger Price</label>
      <label
        for="charger-price-input"
        class="inline-input-wrapper"
        data-label="charger-price-value-container"
      >
        <input
          id="charger-price-input"
          class="inline-number-input"
          type="number"
          step="1"
          :min="CHARGER_PRICE_RANGE.min"
          :max="CHARGER_PRICE_RANGE.max"
          v-model.number="modelValue"
          data-label="charger-price-number-input"
        />
        <span class="has-text-weight-bold ml-1 unit-text">p/kWh</span>
      </label>
    </div>

    <div class="control mb-1 slider-track-wrapper" data-label="charger-price-slider-control">
      <input
        class="slider-input"
        type="range"
        :min="CHARGER_PRICE_RANGE.min"
        :max="CHARGER_PRICE_RANGE.max"
        :step="CHARGER_PRICE_RANGE.step"
        :value="modelValue"
        @input="handleSliderInput"
        data-label="charger-price-slider"
      />
      <span
        v-if="agilePrice !== null"
        class="agile-marker"
        :style="{ left: markerPosition(agilePrice) }"
        :title="`Current Octopus Agile price (Blaenau Ffestiniog): ${agilePrice.toFixed(2)}p/kWh`"
        data-label="agile-price-marker"
      ></span>
    </div>

    <div
      class="is-flex is-justify-content-space-between is-align-items-center px-1 is-flex-wrap-wrap"
      data-label="preset-markers"
    >
      <button
        v-for="preset in PRESET_RATES"
        :key="preset.label"
        class="button is-text is-small p-0 has-text-grey is-size-7"
        type="button"
        @click="modelValue = preset.value"
        data-label="preset-button"
      >
        | {{ preset.label }}
      </button>

      <button
        v-if="agilePrice !== null"
        class="button is-text is-small p-0 has-text-link is-size-7 has-text-weight-semibold"
        type="button"
        @click="modelValue = agilePrice"
        data-label="agile-preset-button"
      >
        | ⚡ Agile now ({{ agilePrice.toFixed(1) }}p)
      </button>
      <span
        v-else-if="agileLoading"
        class="is-size-7 has-text-grey"
        data-label="agile-price-loading"
      >
        | Loading Agile price…
      </span>
      <span
        v-else-if="agileError"
        class="is-size-7 has-text-danger"
        :title="agileError"
        data-label="agile-price-error"
      >
        | Agile price unavailable
      </span>
    </div>
  </div>
</template>

<style scoped>
.slider-track-wrapper {
  position: relative;
}

.agile-marker {
  position: absolute;
  top: -2px;
  width: 3px;
  height: 10px;
  background: var(--bulma-warning, #ffdd57);
  border-radius: 2px;
  transform: translateX(-50%);
  pointer-events: none;
}
</style>
