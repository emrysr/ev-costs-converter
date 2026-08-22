import { ref, onMounted, onUnmounted, type Ref } from 'vue'

type MotionPermissionCtor = {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export function useShakeToReset(
  shakeEnabled: Ref<boolean>,
  shakeThreshold: Ref<number>,
  onShake: () => void
) {
  const shakePermissionGranted = ref<boolean>(false)

  let lastX = 0
  let lastY = 0
  let lastZ = 0
  let lastTime = 0

  function handleMotion(event: DeviceMotionEvent) {
    if (!shakeEnabled.value) return

    const current = event.accelerationIncludingGravity
    if (!current) return

    const currentTime = Date.now()
    if (currentTime - lastTime > 100) {
      const diffTime = currentTime - lastTime
      lastTime = currentTime

      const x = current.x || 0
      const y = current.y || 0
      const z = current.z || 0

      const speed = (Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime) * 10000

      if (speed > shakeThreshold.value) {
        onShake()
      }

      lastX = x
      lastY = y
      lastZ = z
    }
  }

  async function requestMotionPermission() {
    const ctor = DeviceMotionEvent as unknown as MotionPermissionCtor

    if (typeof ctor.requestPermission === 'function') {
      try {
        const response = await ctor.requestPermission()
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

  onMounted(() => {
    if ('DeviceMotionEvent' in window) {
      const ctor = DeviceMotionEvent as unknown as MotionPermissionCtor
      // iOS requires an explicit, user-gesture-triggered permission request
      // (handled by requestMotionPermission, called from the settings button).
      // Everywhere else we can just start listening straight away.
      if (typeof ctor.requestPermission !== 'function') {
        window.addEventListener('devicemotion', handleMotion)
        shakePermissionGranted.value = true
      }
    }
  })

  onUnmounted(() => {
    window.removeEventListener('devicemotion', handleMotion)
  })

  return { shakePermissionGranted, requestMotionPermission }
}
