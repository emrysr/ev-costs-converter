export const DEFAULT_EV_RATE = 24
export const DEFAULT_EV_EFFICIENCY = 3.5
export const DEFAULT_PETROL_MPG = 40
export const DEFAULT_SHAKE_THRESHOLD = 2500
export const DEFAULT_SHAKE_ENABLED = true
export const DEFAULT_BATTERY_CAPACITY = 60
export const DEFAULT_CURRENT_SOC = 20
export const DEFAULT_TARGET_SOC = 80
export const DEFAULT_AGILE_REGION = null

// Octopus Agile tariff regions (DNO regions)
export const AGILE_REGIONS = {
  A: 'Eastern England (UKPN - East Anglia)',
  B: 'East Midlands (UKPN - East Midlands)',
  C: 'London (UKPN - South Eastern)',
  D: 'North Wales, Merseyside & Cheshire (SP Manweb)',
  E: 'West Midlands (UKPN - West Midlands)',
  F: 'Northern Scotland (SEEL - North)',
  G: 'Central Scotland (SEEL - South)',
  H: 'Southern Scotland (SEEL - South West)',
  J: 'Northern Electric (Northern Powergrid - Northern)',
  K: 'Yorkshire (Northern Powergrid - Yorkshire)',
  L: 'North Eastern England (Northern Powergrid - North Eastern)',
  M: 'South Wales (South Wales Electricity)',
  N: 'South East England (SEEL - South Eastern)',
  O: 'North West (Electricity North West)',
  P: 'South West England (South West Water)',
  R: 'Southern Electric Region (Electricity South West)'
} as const

export type AgileRegionCode = keyof typeof AGILE_REGIONS
