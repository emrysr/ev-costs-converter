export interface PricePreset {
  label: string
  value: number
}

export const PRESET_RATES: PricePreset[] = [
  { label: 'Home (7p)', value: 7 },
  { label: 'Public (45p)', value: 45 },
  { label: 'Rapid (79p)', value: 79 }
]

export const CHARGER_PRICE_RANGE = {
  min: -20,
  max: 120,
  step: 1
}

// A slider value snaps to a preset (or the live Agile price) when it's
// dragged to within this many pence of it.
export const SNAP_TOLERANCE_PENCE = 2
