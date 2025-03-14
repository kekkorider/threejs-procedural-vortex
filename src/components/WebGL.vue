<template>
	<canvas
		class="canvas"
		ref="canvasRef"
		:width="windowWidth"
		:height="windowHeight"
	/>
</template>

<script setup>
import { shallowRef, onMounted, nextTick, watch } from 'vue'
import { useWindowSize, useDevicePixelRatio } from '@vueuse/core'
import { Scene, PerspectiveCamera, Mesh, PlaneGeometry } from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls'

import { useGSAP } from '@/composables/useGSAP'
import { SampleTSLMaterial, VortexMaterial } from '@/assets/materials'
import { gltfLoader } from '@/assets/loaders'

const canvasRef = shallowRef(null)
let scene, camera, renderer, planeMesh, controls

const { width: windowWidth, height: windowHeight } = useWindowSize()
const { pixelRatio: dpr } = useDevicePixelRatio()

const { gsap } = useGSAP()

//
// Lifecycle
//
onMounted(async () => {
	await nextTick()

	createScene()
	createCamera()
	createRenderer()

	createPlane()

	createControls()

	gsap.ticker.add(time => {
		updateScene(time)
		renderer.renderAsync(scene, camera)
	})

	const url = new URL(window.location.href)
	if (url.searchParams.get('debug') !== null) {
		await import('@/assets/DebugVortex')
	}
})

//
// Watchers
//
watch(dpr, value => {
	renderer.setPixelRatio(value)
})

watch([windowWidth, windowHeight], value => {
	camera.aspect = value[0] / value[1]
	camera.updateProjectionMatrix()

	renderer.setSize(value[0], value[1])
})

//
// Methods
//
function updateScene(time = 0) {
	controls.update()
}

function createScene() {
	scene = new Scene()
}

function createCamera() {
	camera = new PerspectiveCamera(
		40,
		windowWidth.value / windowHeight.value,
		0.1,
		100
	)
	camera.position.set(0, 0, 3)
}

function createRenderer() {
	renderer = new WebGPURenderer({
		canvas: canvasRef.value,
		alpha: true,
		antialias: dpr.value === 1,
	})

	renderer.setClearColor(0x121212, 1)
	renderer.setSize(windowWidth.value, windowHeight.value)
}

async function loadModel() {
	const gltf = await gltfLoader.load('/monkey.glb')
	const model = gltf.scene.getObjectByName('Suzanne')

	model.material = SampleTSLMaterial
	model.position.x = 1

	scene.add(model)
}

function createControls() {
	controls = new OrbitControls(camera, renderer.domElement)
	controls.enableDamping = true
}

function createPlane() {
	const geometry = new PlaneGeometry(2, 2, 32, 32)
	const material = VortexMaterial

	planeMesh = new Mesh(geometry, material)

	scene.add(planeMesh)
}
</script>

<style scoped>
.canvas {
	height: 100dvh;
	width: 100dvw;
}
</style>
