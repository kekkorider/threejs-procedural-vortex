import { Fn, vec3, normalize, max, float } from 'three/tsl'

export const facture = Fn( ( [ vector_immutable ] ) => {
  const vector = vec3( vector_immutable ).toVar()
  const normalizedVector = vec3( normalize( vector ) ).toVar()

  return max( max( normalizedVector.x, normalizedVector.y ), normalizedVector.z )
})

export const emission = Fn( ( [ color_immutable, strength_immutable ] ) => {
  const strength = float( strength_immutable ).toVar()
  const color = vec3( color_immutable ).toVar()

  return color.mul(strength)
})
