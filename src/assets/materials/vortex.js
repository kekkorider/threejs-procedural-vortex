import { MeshBasicNodeMaterial } from 'three/webgpu'
import {
  Fn,
  vec2,
  vec3,
  vec4,
  uv,
  uniform,
  normalize,
  time,
  mul,
  float,
  log2,
  length,
  cos,
  sin,
  pow,
  mix,
  varying
} from 'three/tsl'
import { fbm3d } from '@/assets/tsl/fbm'
import { facture, emission } from '@/assets/tsl/utils'

export const VortexMaterial = new MeshBasicNodeMaterial({
  wireframe: false,
  transparent: true
})

const resolution = uniform(vec2(2, 2))
export const speed = uniform(0.25)
export const frequency = uniform(1.3)
export const distortion = uniform(0.01)
export const emissionColor = uniform(vec3(0.1, 0.6, 1))
export const emissionMultiplier = uniform(2)

const vSwirl = varying(vec4(0), 'vSwirl')

const rotateZ = Fn( ([v_immutable, angle_immutable]) => {
  const angle = float(angle_immutable).toVar()
  const v = vec3(v_immutable).toVar()
  const cosAngle = float(cos( angle) ).toVar()
  const sinAngle = float(sin( angle) ).toVar()

  return vec3(
    v.x.mul(cosAngle).sub(v.y.mul(sinAngle)),
    v.x.mul(sinAngle).add(v.y.mul(cosAngle)),
    v.z
  )
})

VortexMaterial.colorNode = Fn(() => {
  const aspect = resolution.value.x / resolution.value.y

  const _uv = uv().mul(2).sub(1)
  _uv.y.mulAssign(aspect)

  const color = vec3(_uv, 0.0).toVar()
  color.z.addAssign(0.5)
  color.assign(normalize(color))
  color.subAssign(mul(speed, vec3(0, 0, time.mul(0.3))))

  const angle = float(log2(length(_uv)).negate()).toVar()
  color.assign(rotateZ(color, angle))

  color.x.assign(fbm3d(color.mul(frequency).add(0), 5).add(distortion))
  color.y.assign(fbm3d(color.mul(frequency).add(1), 5).add(distortion))
  color.z.assign(fbm3d(color.mul(frequency).add(1), 5).add(distortion))

  const noiseColor = color.toVar()
  noiseColor.mulAssign(2)
  noiseColor.subAssign(0.1)
  noiseColor.mulAssign(0.188)
  noiseColor.addAssign(vec3(_uv, 0))

  const noiseColorLength = length(noiseColor)
  noiseColorLength.assign(float(0.77).sub(noiseColorLength))
  noiseColorLength.mulAssign(4.2)
  noiseColorLength.assign(pow(noiseColorLength, 1))

  const fac = length(_uv).sub(facture(color.add(0.32)))
  fac.addAssign(0.1)
  fac.mulAssign(3)

  const emissionCol = emission(emissionColor, noiseColorLength.mul(emissionMultiplier))

  color.assign(mix(emissionCol, vec3(fac), fac.add(1.2)))

  const alpha = float(1).sub(fac)

  return vec4(color, alpha)
})()
