<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  costPerMile: string
  pencePerLitre: string
  equivalentYear: number
  isOutBounds: boolean
}>()

const copyFeedback = ref<boolean>(false)

async function copyResultsSummary() {
  const text = `EV Cost Converter: ${props.costPerMile}p/mile (Equiv. ${props.pencePerLitre}p/Litre, Year ${props.equivalentYear})`
  try {
    await navigator.clipboard.writeText(text)
    copyFeedback.value = true
    setTimeout(() => {
      copyFeedback.value = false
    }, 2000)
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div
    class="notification is-link is-light mt-4 results-box has-text-centered"
    @dblclick="copyResultsSummary"
    title="Double-click to copy summary"
    data-label="results-notification"
  >
    <p class="is-size-6 mb-1" data-label="cost-per-mile-output">
      <strong>Cost Per Mile:</strong> {{ costPerMile }}p
    </p>
    <p class="is-size-6 mb-2" data-label="pence-per-litre-output">
      <strong>Equiv. Petrol Price:</strong> {{ pencePerLitre }}p / Litre
    </p>
    <hr
      class="my-2 mx-auto"
      style="background-color: var(--bulma-border); width: 80%;"
      data-label="results-divider"
    />
    <div
      class="is-flex is-align-items-center is-flex-wrap-wrap is-justify-content-center"
      data-label="equivalent-year-container"
    >
      <p class="is-size-5 has-text-weight-bold has-text-link mr-2 mb-0" data-label="equivalent-year-output">
        Equivalent Year: {{ equivalentYear }}
      </p>
      <span
        v-if="isOutBounds"
        class="tag is-warning is-light has-text-weight-semibold mt-1"
        data-label="out-of-bounds-badge"
      >
        Beyond data range
      </span>
    </div>
    <p class="is-size-7 has-text-grey-dark mt-2 mb-0 is-italic" style="user-select: none;">
      💡 Double-click box to copy summary
    </p>
    <div v-if="copyFeedback" class="has-text-success is-size-7 has-text-weight-bold mt-1" data-label="copy-feedback">
      ✓ Copied to clipboard!
    </div>
  </div>
</template>
