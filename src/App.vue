<script setup lang="ts">
import { ref, computed } from 'vue'

interface CalculationResult {
  costPerMile: string
  pencePerLitre: string
  equivalentYear: number
}

const evRate = ref<number>(24.0)
const evEfficiency = ref<number>(3.5)
const petrolMpg = ref<number>(40.0)

const YEARLY_PETROL_PRICES: Record<number, number> = {
  1990: 40.2, 1992: 40.3, 1994: 48.9, 1996: 52.9, 1998: 60.9,
  2000: 76.9, 2002: 69.9, 2004: 77.9, 2006: 88.9, 2008: 103.9,
  2010: 111.9, 2012: 134.1, 2014: 130.9, 2016: 103.9, 2018: 115.9,
  2020: 119.9, 2022: 159.9, 2023: 138.9, 2024: 145.9
}

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

const equivalentYear = computed<number>(() => {
  const currentPence = parseFloat(pencePerLitre.value)
  const years = Object.keys(YEARLY_PETROL_PRICES).map(Number)
  
  return years.reduce((closest, year) => {
    const prevDiff = Math.abs(YEARLY_PETROL_PRICES[closest] - currentPence)
    const currDiff = Math.abs(YEARLY_PETROL_PRICES[year] - currentPence)
    return currDiff < prevDiff ? year : closest
  }, years[0])
})
</script>

<template>
  <main style="max-width: 400px; margin: 2rem auto; font-family: system-ui, sans-serif; padding: 1rem;">
    <h2>EV to Petrol Converter</h2>
    
    <div style="margin-bottom: 1rem;">
      <label>Charger Price (p/kWh):</label>
      <input type="number" v-model.number="evRate" style="width: 100%; padding: 0.5rem;" />
    </div>

    <div style="margin-bottom: 1rem;">
      <label>EV Efficiency (mi/kWh):</label>
      <input type="number" step="0.1" v-model.number="evEfficiency" style="width: 100%; padding: 0.5rem;" />
    </div>

    <div style="margin-bottom: 1rem;">
      <label>Equivalent Petrol MPG:</label>
      <input type="number" step="1" v-model.number="petrolMpg" style="width: 100%; padding: 0.5rem;" />
    </div>

    <hr />

    <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px;">
      <p><strong>Cost Per Mile:</strong> {{ costPerMile }}p</p>
      <p><strong>Equiv. Petrol Price:</strong> {{ pencePerLitre }}p / Litre</p>
      <p style="font-size: 1.2rem; color: #0284c7;">
        <strong>Equivalent Year:</strong> {{ equivalentYear }}
      </p>
    </div>
  </main>
</template>
