<script setup lang="ts">
const modelValue = defineModel<number>({ required: true })
</script>

<template>
  <div class="field mb-5" data-label="efficiency-group">
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-1">
      <label class="label mb-0" data-label="efficiency-label">EV Efficiency</label>
      <label
        for="efficiency-input"
        class="inline-input-wrapper"
        data-label="efficiency-value-container"
      >
        <input
          id="efficiency-input"
          class="inline-number-input"
          type="number"
          step="0.1"
          min="1.5"
          max="8.0"
          v-model.number="modelValue"
          data-label="efficiency-number-input"
        />
        <span class="has-text-weight-bold ml-1 unit-text">mi/kWh</span>
      </label>
    </div>
    <div class="control" data-label="efficiency-slider-control">
      <input
        class="slider-input"
        type="range"
        min="1.5"
        max="8.0"
        step="0.1"
        v-model.number="modelValue"
        data-label="efficiency-slider"
      />
    </div>
  </div>
</template>
