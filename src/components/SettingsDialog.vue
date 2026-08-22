<script setup lang="ts">
import { ref } from 'vue'
import { AGILE_REGIONS, type AgileRegionCode } from '../constants/defaults'

const shakeEnabled = defineModel<boolean>('shakeEnabled', { required: true })
const shakeThreshold = defineModel<number>('shakeThreshold', { required: true })
const agileRegion = defineModel<AgileRegionCode | null>('agileRegion', { required: true })

const emit = defineEmits<{
  (e: 'reset'): void
}>()

const dialogEl = ref<HTMLDialogElement | null>(null)

function open() {
  dialogEl.value?.showModal()
}

function close() {
  dialogEl.value?.close()
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === dialogEl.value) {
    close()
  }
}

defineExpose({ open, close })
</script>

<template>
  <dialog
    ref="dialogEl"
    class="settings-dialog"
    @click="handleBackdropClick"
    data-label="settings-dialog"
  >
    <div class="card" data-label="settings-card">
      <header class="card-header" data-label="settings-card-header">
        <p class="card-header-title mb-0" data-label="settings-title">Settings</p>
        <button
          class="delete m-3"
          aria-label="close"
          @click="close"
          data-label="close-dialog-x-button"
        ></button>
      </header>
      <div class="card-content" data-label="settings-card-content">
        <p class="is-size-7 has-text-grey mb-4" data-label="app-intro-description">
          This app compares electric vehicle charging costs with equivalent petrol prices, showing
          what year historically matched your current cost per mile.
        </p>

        <div class="field mb-4" data-label="agile-region-group">
          <label class="label" data-label="agile-region-label">Octopus Agile Region (Optional)</label>
          <div class="control" data-label="agile-region-control">
            <div class="select is-fullwidth">
              <select v-model="agileRegion" data-label="agile-region-select">
                <option :value="null">No region selected (Agile pricing disabled)</option>
                <option v-for="(description, code) in AGILE_REGIONS" :key="code" :value="code">
                  {{ code }} - {{ description }}
                </option>
              </select>
            </div>
          </div>
          <p class="help has-text-grey" data-label="agile-region-help">
            Select your DNO region to enable live Octopus Agile electricity pricing. The lightning-bolt marker
            will show your current half-hour rate.
          </p>
        </div>

        <div class="field mb-4" data-label="shake-toggle-group">
          <label class="checkbox label mb-0 is-flex is-align-items-center" data-label="shake-toggle-label">
            <input
              type="checkbox"
              v-model="shakeEnabled"
              class="mr-2"
              data-label="shake-toggle-checkbox"
            />
            Enable Shake to Reset
          </label>
        </div>

        <div v-if="shakeEnabled" class="field mb-4" data-label="shake-threshold-group">
          <div class="is-flex is-justify-content-space-between is-align-items-center mb-1">
            <label class="label mb-0" data-label="shake-threshold-label">Shake Sensitivity</label>
            <span class="has-text-weight-semibold" data-label="shake-threshold-value">{{ shakeThreshold }}</span>
          </div>
          <div class="control" data-label="shake-threshold-slider-control">
            <input
              class="slider-input"
              type="range"
              min="800"
              max="5000"
              step="100"
              v-model.number="shakeThreshold"
              data-label="shake-threshold-slider"
            />
          </div>
          <p class="help has-text-grey" data-label="shake-threshold-help">
            Higher values require a harder shake to prevent accidental resets when picking up your phone.
          </p>
        </div>

        <hr class="my-4" style="background-color: var(--bulma-border);" />

        <button
          class="button is-danger is-light is-fullwidth"
          @click="emit('reset')"
          data-label="dialog-reset-button"
        >
          Reset All Values to Defaults
        </button>
      </div>
      <footer class="card-footer" data-label="settings-card-footer">
        <button
          class="card-footer-item button is-ghost py-2"
          @click="close"
          data-label="dialog-done-button"
        >
          Done
        </button>
      </footer>
    </div>
  </dialog>
</template>
