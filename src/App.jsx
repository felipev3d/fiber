
import * as THREE from 'three'
import { memo, useRef, forwardRef } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { Grid, Center, AccumulativeShadows, RandomizedLight, Environment, useGLTF, CameraControls, EnvironmentCube, SpotLight, Box, SoftShadows, useTexture } from '@react-three/drei'
import { useControls, button, buttonGroup, folder } from 'leva'
import { suspend } from 'suspend-react'
import { GLTFLoader, USDZExporter } from 'three-stdlib'
import { Object3D } from 'three'
import TripleStShader from './TripleStShader'
import { TextureLoader } from 'three'
import { XR, XRButton } from '@react-three/xr'



const { DEG2RAD } = THREE.MathUtils
const y = 1
const dx = 1.0
const ligthPosition = [
  [-1 * dx, y, -1 * dx],
  [-1 * dx, y + .5, 1 * dx],
  [1 * dx, y - .5, 1 * dx]
]




export default function App() {
  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 60 }}>

        <Scene />
        {
          ligthPosition.map((position, index) => {
            return <Box

              args={[0.1, 0.1, 0.1]}                // Args for the buffer geometry
              scale={[1, 1, 1]}     // All THREE.Mesh props are valid
              material={new THREE.MeshLambertMaterial({ color: 'rgb(255,255,255)', emissive: 0xffffff })}
              position={position}
            />
          })
        }

        <Model ligthPosition={ligthPosition} />


      </Canvas >
    </>

  )
}

function Scene() {
  const meshRef = useRef()
  const cameraControlsRef = useRef()

  const { camera } = useThree()

  // All same options as the original "basic" example: https://yomotsu.github.io/camera-controls/examples/basic.html
  const { minDistance, enabled, verticalDragToForward, dollyToCursor, infinityDolly } = useControls({
    camera: folder(
      {

        thetaGrp: buttonGroup({
          label: 'rotate theta',
          opts: {
            '+45º': () => cameraControlsRef.current?.rotate(45 * DEG2RAD, 0, true),
            '-90º': () => cameraControlsRef.current?.rotate(-90 * DEG2RAD, 0, true),
            '+360º': () => cameraControlsRef.current?.rotate(360 * DEG2RAD, 0, true)
          }
        }),
        phiGrp: buttonGroup({
          label: 'rotate phi',
          opts: {
            '+20º': () => cameraControlsRef.current?.rotate(0, 20 * DEG2RAD, true),
            '-40º': () => cameraControlsRef.current?.rotate(0, -40 * DEG2RAD, true)
          }
        }),
        truckGrp: buttonGroup({
          label: 'truck',
          opts: {
            '(1,0)': () => cameraControlsRef.current?.truck(1, 0, true),
            '(0,1)': () => cameraControlsRef.current?.truck(0, 1, true),
            '(-1,-1)': () => cameraControlsRef.current?.truck(-1, -1, true)
          }
        }),
        dollyGrp: buttonGroup({
          label: 'dolly',
          opts: {
            '1': () => cameraControlsRef.current?.dolly(1, true),
            '-1': () => cameraControlsRef.current?.dolly(-1, true)
          }
        }),
        zoomGrp: buttonGroup({
          label: 'zoom',
          opts: {
            '/2': () => cameraControlsRef.current?.zoom(camera.zoom / 2, true),
            '/-2': () => cameraControlsRef.current?.zoom(-camera.zoom / 2, true)
          }
        }),
        minDistance: { value: 0 },
        moveTo: folder(
          {
            vec1: { value: [3, 5, 2], label: 'vec' },
            'moveTo(…vec)': button((get) => cameraControlsRef.current?.moveTo(...get('moveTo.vec1'), true))
          },
          { collapsed: true }
        ),
        'fitToBox(mesh)': button(() => cameraControlsRef.current?.fitToBox(meshRef.current, true)),
        setPosition: folder(
          {
            vec2: { value: [-5, 2, 1], label: 'vec' },
            'setPosition(…vec)': button((get) => cameraControlsRef.current?.setPosition(...get('setPosition.vec2'), true))
          },
          { collapsed: true }
        ),
        setTarget: folder(
          {
            vec3: { value: [3, 0, -3], label: 'vec' },
            'setTarget(…vec)': button((get) => cameraControlsRef.current?.setTarget(...get('setTarget.vec3'), true))
          },
          { collapsed: true }
        ),
        setLookAt: folder(
          {
            vec4: { value: [1, 2, 3], label: 'position' },
            vec5: { value: [1, 1, 0], label: 'target' },
            'setLookAt(…position, …target)': button((get) => cameraControlsRef.current?.setLookAt(...get('setLookAt.vec4'), ...get('setLookAt.vec5'), true))
          },
          { collapsed: true }
        ),
        lerpLookAt: folder(
          {
            vec6: { value: [-2, 0, 0], label: 'posA' },
            vec7: { value: [1, 1, 0], label: 'tgtA' },
            vec8: { value: [0, 2, 5], label: 'posB' },
            vec9: { value: [-1, 0, 0], label: 'tgtB' },
            t: { value: Math.random(), label: 't', min: 0, max: 1 },
            'f(…posA,…tgtA,…posB,…tgtB,t)': button((get) => {
              return cameraControlsRef.current?.lerpLookAt(
                ...get('lerpLookAt.vec6'),
                ...get('lerpLookAt.vec7'),
                ...get('lerpLookAt.vec8'),
                ...get('lerpLookAt.vec9'),
                get('lerpLookAt.t'),
                true
              )
            })
          },
          { collapsed: true }
        ),

        saveState: button(() => cameraControlsRef.current?.saveState()),
        reset: button(() => cameraControlsRef.current?.reset(true)),
        enabled: { value: true, label: 'controls on' },
        verticalDragToForward: { value: false, label: 'vert. drag to move forward' },
        dollyToCursor: { value: false, label: 'dolly to cursor' },
        infinityDolly: { value: false, label: 'infinity dolly' },
      }),



  })



  return (
    <>
      <group position-y={-0.5}>
        <Environment preset="studio" />
        <Ground />

        <CameraControls
          ref={cameraControlsRef}
          minDistance={minDistance}
          enabled={enabled}
          verticalDragToForward={verticalDragToForward}
          dollyToCursor={dollyToCursor}
          infinityDolly={infinityDolly}
        />

      </group>
    </>
  )
}

function Ground() {
  const gridConfig = {
    cellSize: 0.5,
    cellThickness: 0.5,
    cellColor: '#6f6f6f',
    sectionSize: 3,
    sectionThickness: 1,
    sectionColor: '#9d4b4b',
    fadeDistance: 30,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
  }
  return <Grid position={[0, -0.01, 0]} args={[10.5, 10.5]} {...gridConfig} />
}

const fabricData = [
  {
    name: "Buff_6518_49",
    baseColor: "/Buff_6518_49_BaseColor.jpeg",
    normal: "/Buff_6518_49_Normal.png",
    roughness: "/Buff_6518_49_Roughness.jpeg",
    scale: 8,
    ratio: 0.6524946
  },
  {
    name: "Cycle_6227S",
    baseColor: "/Cycle_6227S_10_BaseColor.jpeg ",
    normal: " /Cycle_6227S_10_Normal.png",
    roughness: "/Cycle_6227S_10_Roughness.jpeg",
    scale: 7,
    ratio: 0.6165312
  }
]
const Model = ({ ligthPosition }) => {
  const { scene } = useThree()
  const path = '/A1.gltf'
  const path2 = `https://apistorage.v2fineinteriors.app/components/A1_BC_SH17_DT8_T1_PLD_36x8x29_TS1.gltf`
  const gltf = useLoader(GLTFLoader, path)
  // material is  myShaderMaterial
  const [colorMap, normalMap, roughnessMap] = useTexture([
    fabricData[0].baseColor,
    fabricData[0].normal,
    fabricData[0].roughness,
  ],
    (loader) => {

      Object.keys(loader).forEach(key => {

        console.log(loader[key])
        loader[key].wrapS = loader[key].wrapT = THREE.RepeatWrapping;
        loader[key].repeat.set(15, 15)


      })
    }
  );



  const controls = useControls({

    StandarMaterial: folder({

      roughness: { value: 0.1, min: 0, max: 1, step: 0.01 },

      envMapIntensity: { value: 1, min: 0, max: 1, step: 0.01 },
      clearcoat: { value: 0, min: 0, max: 1, step: 0.01 },
      clearcoatRoughness: { value: 0, min: 0, max: 1, step: 0.01 },
      reflectivity: { value: 0, min: 0, max: 1, step: 0.01 },
      refractionRatio: { value: 0, min: 0, max: 1, step: 0.01 },
      clearcoatNormalScale: [0, 0]
    }),
  })

  return (

    <group>
      {

        Object.keys(gltf.nodes).map((key, __index) => {
          gltf.nodes[key].receiveShadows = true
          gltf.nodes[key].castShadows = true
          const _index = 0
          return key.includes("A1_A_") &&
            gltf.nodes[key].hasOwnProperty("geometry")
            ? null
            :
            gltf.nodes[key].children.map((child, index) => {
              // if is divisible by 2 then is a 0 else 1
              const _index = !index % 2 === 0 ? 0 : 1

              return < mesh key={"s1" + _index + index}
                position={child.position}
                onClick={(w) => {
                  console.log(w)
                }}
                geometry={child.geometry}>
                {Object.keys(child.geometry.attributes).includes('uv3') ?
                  < TripleStShader

                    materialPaths={[
                      fabricData[_index].baseColor,
                      fabricData[_index].normal,
                      fabricData[_index].roughness]}
                    stPats={["/Double_Top_Stitch_Medium_1_BaseColor.jpg",
                      "/Double_Top_Stitch_Medium_1_Normal.png"
                    ]}
                    scale={fabricData[_index].scale}
                    ratio={fabricData[_index].ratio}
                    ligthPosition={ligthPosition}
                  />
                  :

                  <>
                    < meshPhysicalMaterial
                      map={colorMap}
                      clearcoatNormalMap={normalMap}
                      roughnessMap={roughnessMap}
                      roughness={controls.roughness}

                      clearcoatNormalScale={[1, 1]}

                      envMapIntensity={controls.envMapIntensity}
                      clearcoat={controls.clearcoat}
                      clearcoatRoughness={controls.clearcoatRoughness}
                      reflectivity={controls.reflectivity}
                      refractionRatio={controls.refractionRatio}


                    />
                    <SoftShadows /></>









                }
              </mesh>
            }
            )







        })
      }





    </group >
  )
}

const Shadows = memo(() => (
  <AccumulativeShadows temporal frames={100} color="#9d4b4b" colorBlend={0.5} alphaTest={0.9} scale={20}>
    {/* <RandomizedLight amount={8} radius={4} position={[5, 5, -10]} /> */}
  </AccumulativeShadows>
))
