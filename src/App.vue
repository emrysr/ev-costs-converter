<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const DEFAULT_EV_RATE = 24
const DEFAULT_EV_EFFICIENCY = 3.5
const DEFAULT_PETROL_MPG = 40
const DEFAULT_SHAKE_THRESHOLD = 2500

const evRate = ref<number>(DEFAULT_EV_RATE)
const evEfficiency = ref<number>(DEFAULT_EV_EFFICIENCY)
const petrolMpg = ref<number>(DEFAULT_PETROL_MPG)
const shakeThreshold = ref<number>(DEFAULT_SHAKE_THRESHOLD)
const shakeEnabled = ref<boolean>(true)

const settingsDialog = ref<HTMLDialogElement | null>(null)
const shakePermissionGranted = ref<boolean>(false)

let lastX = 0, lastY = 0, lastZ = 0
let lastTime = 0

const YEARLY_PETROL_PRICES: Record<number, number> = {
  1975: 15.8, 1977: 17.2, 1979: 21.6, 1980: 28.2, 1982: 36.5,
  1984: 38.7, 1986: 38.2, 1988: 34.7, 1990: 40.2, 1992: 40.3,
  1994: 48.9, 1996: 52.9, 1998: 60.9, 2000: 76.9, 2002: 69.9,
  2004: 77.9, 2006: 88.9, 2008: 103.9, 2010: 111.9, 2012: 134.1,
  2014: 130.9, 2016: 103.9, 2018: 115.9, 2020: 119.9, 2022: 159.9,
  2023: 138.9, 2024: 145.9
}

function handleMotion(event: DeviceMotionEvent) {
  if (!shakeEnabled.value) return

  const current = event.accelerationIncludingGravity
  if (!current) return

  const currentTime = Date.now()
  if ((currentTime - lastTime) > 100) {
    const diffTime = currentTime - lastTime
    lastTime = currentTime

    const x = current.x || 0
    const y = current.y || 0
    const z = current.z || 0

    const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000

    if (speed > shakeThreshold.value) {
      resetToDefaults()
    }

    lastX = x
    lastY = y
    lastZ = z
  }
}

async function requestMotionPermission() {
  if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    try {
      const response = await (DeviceMotionEvent as any).requestPermission()
      if (response === 'granted') {
        window.addEventListener('devicemotion', handleMotion)
        shakePermissionGranted.value = true
      }
    } catch (e) {
      console.error(e)
    }
  } else {
    window.addEventListener('devicemotion', handleMotion)
    shakePermissionGranted.value = true
  }
}

function openSettings() {
  if (!shakePermissionGranted.value && 'DeviceMotionEvent' in window) {
    requestMotionPermission()
  }
  settingsDialog.value?.showModal()
}

function closeSettings() {
  settingsDialog.value?.close()
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === settingsDialog.value) {
    closeSettings()
  }
}

function resetToDefaults() {
  evRate.value = DEFAULT_EV_RATE
  evEfficiency.value = DEFAULT_EV_EFFICIENCY
  petrolMpg.value = DEFAULT_PETROL_MPG
  shakeThreshold.value = DEFAULT_SHAKE_THRESHOLD
  shakeEnabled.value = true
  localStorage.clear()
}

onMounted(() => {
  const savedEvRate = localStorage.getItem('ev_rate')
  const savedEvEfficiency = localStorage.getItem('ev_efficiency')
  const savedPetrolMpg = localStorage.getItem('petrol_mpg')
  const savedShakeThreshold = localStorage.getItem('shake_threshold')
  const savedShakeEnabled = localStorage.getItem('shake_enabled')

  if (savedEvRate !== null) evRate.value = parseFloat(savedEvRate)
  if (savedEvEfficiency !== null) evEfficiency.value = parseFloat(savedEvEfficiency)
  if (savedPetrolMpg !== null) petrolMpg.value = parseFloat(savedPetrolMpg)
  if (savedShakeThreshold !== null) shakeThreshold.value = parseInt(savedShakeThreshold, 10)
  if (savedShakeEnabled !== null) shakeEnabled.value = savedShakeEnabled === 'true'

  if ('DeviceMotionEvent' in window && typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
    window.addEventListener('devicemotion', handleMotion)
    shakePermissionGranted.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('devicemotion', handleMotion)
})

watch(
  [evRate, evEfficiency, petrolMpg, shakeThreshold, shakeEnabled],
  ([newRate, newEfficiency, newMpg, newThreshold, newShakeEnabled]) => {
    localStorage.setItem('ev_rate', newRate.toString())
    localStorage.setItem('ev_efficiency', newEfficiency.toString())
    localStorage.setItem('petrol_mpg', newMpg.toString())
    localStorage.setItem('shake_threshold', newThreshold.toString())
    localStorage.setItem('shake_enabled', newShakeEnabled.toString())
  }
)

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

const equivalentYearResult = computed<{ year: number; isOutBounds: boolean }>(() => {
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
        
        <!-- Charger Price Control -->
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
                min="-20" 
                max="120" 
                v-model.number="evRate" 
                data-label="charger-price-number-input"
              />
              <span class="has-text-weight-bold ml-1 unit-text">p/kWh</span>
            </label>
          </div>
          <div class="control" data-label="charger-price-slider-control">
            <input 
              class="slider-input" 
              type="range" 
              min="-20" 
              max="120" 
              step="1" 
              v-model.number="evRate" 
              data-label="charger-price-slider"
            />
          </div>
        </div>

        <!-- EV Efficiency Control -->
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
                v-model.number="evEfficiency" 
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
              v-model.number="evEfficiency" 
              data-label="efficiency-slider"
            />
          </div>
        </div>

        <!-- Petrol MPG Control -->
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
                v-model.number="petrolMpg" 
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
              v-model.number="petrolMpg" 
              data-label="petrol-mpg-slider"
            />
          </div>
        </div>

        <!-- Outputs -->
        <div class="notification is-link is-light mt-5" data-label="results-notification">
          <p class="is-size-6 mb-1" data-label="cost-per-mile-output">
            <strong>Cost Per Mile:</strong> {{ costPerMile }}p
          </p>
          <p class="is-size-6 mb-2" data-label="pence-per-litre-output">
            <strong>Equiv. Petrol Price:</strong> {{ pencePerLitre }}p / Litre
          </p>
          <hr class="my-2" style="background-color: var(--bulma-border);" data-label="results-divider" />
          <div class="is-flex is-align-items-center is-flex-wrap-wrap" data-label="equivalent-year-container">
            <p class="is-size-5 has-text-weight-bold has-text-link mr-2" data-label="equivalent-year-output">
              Equivalent Year: {{ equivalentYearResult.year }}
            </p>
            <span 
              v-if="equivalentYearResult.isOutBounds" 
              class="tag is-warning is-light has-text-weight-semibold mt-1"
              data-label="out-of-bounds-badge"
            >
              Beyond the data range
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Native HTML Dialog with Bulma Card Styling -->
    <dialog 
      ref="settingsDialog" 
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
            @click="closeSettings" 
            data-label="close-dialog-x-button"
          ></button>
        </header>
        <div class="card-content" data-label="settings-card-content">
          <!-- Intro Text -->
          <p class="is-size-7 has-text-grey mb-4" data-label="app-intro-description">
            This app compares electric vehicle charging costs with equivalent petrol prices, showing what year historically matched your current cost per mile.
          </p>

          <!-- Shake Toggle -->
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

          <!-- Shake Sensitivity Setting (Only visible if Shake is enabled) -->
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

          <!-- Manual Reset Button -->
          <button 
            class="button is-danger is-light is-fullwidth" 
            @click="resetToDefaults"
            data-label="dialog-reset-button"
          >
            Reset All Values to Defaults
          </button>
        </div>
        <footer class="card-footer" data-label="settings-card-footer">
          <button 
            class="card-footer-item button is-ghost py-2" 
            @click="closeSettings"
            data-label="dialog-done-button"
          >
            Done
          </button>
        </footer>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
.slider-input {
  width: 100%;
  height: 6px;
  background: var(--bulma-border-weak, var(--bulma-border));
  border-radius: 3px;
  outline: none;
  accent-color: var(--bulma-link);
}

.inline-input-wrapper {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.inline-number-input {
  border: none;
  background: transparent;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--bulma-text);
  text-align: right;
  width: 3.5rem;
  padding: 0;
  outline: none;
}

.unit-text {
  font-size: 1.1rem;
  color: var(--bulma-text);
}

.inline-number-input:focus {
  border-bottom: 2px solid var(--bulma-link);
}

.inline-number-input::-webkit-outer-spin-button,
.inline-number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.inline-number-input[type="number"] {
  -moz-appearance: textfield;
}

/* Native Dialog Styles */
.settings-dialog {
  border: none;
  border-radius: 8px;
  padding: 0;
  max-width: 400px;
  width: 90vw;
  background: transparent;
}

.settings-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
</style>
