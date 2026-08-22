<script setup lang="ts">
const modelValue = defineModel<number>({ required: true })
</script>

<template>
  <div class="field mb-5" data-label="petrol-mpg-group">
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-1">
      <label class="label mb-0" data-label="petrol-mpg-label">Equivalent Petrol MPG</label>
      <label
        for="petrol-mpg-input"
        class="inline-input-wrapper"
        data-label="petrol-mpg-value-container"
      >
        <input
          id="petrol-mpg-input"
          class="inline-number-input"
          type="number"
          step="1"
          min="10"
          max="100"
          v-model.number="modelValue"
          data-label="petrol-mpg-number-input"
        />
        <span class="has-text-weight-bold ml-1 unit-text">MPG</span>
      </label>
    </div>
    <div class="control" data-label="petrol-mpg-slider-control">
      <input
        class="slider-input"
        type="range"
        min="10"
        max="100"
        step="1"
        v-model.number="modelValue"
        data-label="petrol-mpg-slider"
      />
    </div>
  </div>
</template>
