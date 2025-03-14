import { Pane } from 'tweakpane'

import {
  speed,
  frequency,
  distortion,
  emissionColor,
  emissionMultiplier
} from '@/assets/materials/vortex'

const pane = new Pane()

pane.addBinding(speed, 'value', { label: 'Speed', min: 0, max: 2, step: 0.01 })
pane.addBinding(frequency, 'value', { label: 'Frequency', min: 0.1, max: 5, step: 0.01 })
pane.addBinding(distortion, 'value', { label: 'Distortion', min: 0, max: 0.3, step: 0.01 })
pane.addBinding(emissionColor, 'value', { label: 'Emission color', color: { type: 'float' } })
pane.addBinding(emissionMultiplier, 'value', { label: 'Emission multiplier', min: 0, max: 5, step: 0.01 })
