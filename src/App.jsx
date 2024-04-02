
import * as THREE from 'three'
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { Grid, Center, AccumulativeShadows, RandomizedLight, Environment, useGLTF, CameraControls, EnvironmentCube, SpotLight, Box, SoftShadows, useTexture } from '@react-three/drei'
import { useControls, button, buttonGroup, folder } from 'leva'
import { GLTFLoader, USDZExporter } from 'three-stdlib'
import BaseFrame from './base/baseFrame'



const { DEG2RAD } = THREE.MathUtils




export default function App() {
  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 20 }}>

        <Scene />
        <Model />

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
        reset: button(() => {
          cameraControlsRef.current?.reset(true);
          console.log(cameraControlsRef.current)
        }),
        enabled: { value: true, label: 'controls on' },
        verticalDragToForward: { value: false, label: 'vert. drag to move forward' },
        dollyToCursor: { value: false, label: 'dolly to cursor' },
        infinityDolly: { value: false, label: 'infinity dolly' },
      }),



  })


  useEffect(() => {
    cameraControlsRef.current.setTarget(.45, .19, -0.4)
    cameraControlsRef.current.setPosition(
      0.8467222254632364,
      0.3486523543220764,
      -0.04093306919456041
    )
  }, [])

  return (
    <>
      <group position-y={-0.5}>
        {/* <Environment preset="studio" /> */}
        <Ground />
        <pointLight position={[.7, .7, .7]} intensity={6} />
        <ambientLight intensity={5} />
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
    name: "Buff_6518_40",
    baseColor: "/Buff_6518_40_BaseColor.jpeg",
    normal: "/Buff_6518_40_Normal.png",
    roughness: "/Buff_6518_40_Roughness.jpeg",
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

const stichTypes = {
  "French Seam": ['French_Seam_1_BaseColor.jpg', 'French_Seam_1_Normal.png'],
  "Top Stitch": ['Single_Top_Stitch_Medium_1_BaseColor.jpg', 'Single_Top_Stitch_Medium_1_Normal.png'],
  "Double Top Stitch": ['Double_Top_Stitch_Medium_1_BaseColor.jpg', 'Double_Top_Stitch_Medium_1_Normal.png'],
}

const Model = () => {
  const { scene } = useThree()
  const path = '/A10_BC_SH18_PL_T1_PL_48x6x20_MULTI.gltf'
  const gltf = useLoader(GLTFLoader, path)
  const [_colorMap, set_colorMap] = useState(stichTypes['Double Top Stitch'][0])
  const [_normalMap, set_normalMap] = useState(stichTypes['Double Top Stitch'][1])

  const [colorMap, normalMap, roughnessMap, stColor, stNormal] = useTexture([
    fabricData[0].baseColor,
    fabricData[0].normal,
    fabricData[0].roughness,
    _colorMap, _normalMap

  ]
  );
  useLayoutEffect(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace;
    normalMap.colorSpace = THREE.NoColorSpace;
    roughnessMap.colorSpace = THREE.NoColorSpace;
    stColor.colorSpace = THREE.SRGBColorSpace;
    stNormal.colorSpace = THREE.NoColorSpace;

    colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
    stColor.wrapS = stColor.wrapT = THREE.RepeatWrapping;
    stNormal.wrapS = stNormal.wrapT = THREE.RepeatWrapping;


    colorMap.repeat.set(fabricData[0].scale, fabricData[0].scale);
    normalMap.repeat.set(fabricData[0].scale, fabricData[0].scale);
    roughnessMap.repeat.set(fabricData[0].scale, fabricData[0].scale);
    return () => [colorMap, normalMap, roughnessMap].forEach(map => map.dispose());
  }, [colorMap]);


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

  const props = useMemo(() => {
    return {
      map: colorMap,
      normalMap,
      roughnessMap,
      controls
    }
  }, [colorMap, normalMap, roughnessMap, controls])

  const stProps = useMemo(() => {
    stNormal.generateMipmaps = false
    return {
      map: stColor,
      normalMap: stNormal,
      blending: THREE.NormalBlending,
      transparent: true,
      side: THREE.FrontSide,
      opacity: 0.9,
      alphaTest: 0.5,
      alphaMap: stNormal,
      normalMapType: THREE.NormalBlending,
      alphaToCoverage: true,

    }
  }, [stColor, stNormal])




  return (
    <group position={[0, -.5, 0]}>
      {
        gltf.scene.children.map((obj, index) => {
          return obj.isMesh
            ? obj.name.includes('_STT1') &&
            <mesh
              key={index}
              geometry={obj.geometry}
              position={obj.position}
              rotation={obj.rotation}
              scale={[1.0003, 1.0003, 1.0003]}
            >
              <meshPhysicalMaterial
                {...stProps}
              />
            </mesh>

            : obj.isGroup &&
            <group key={index + 'group'} position={obj.position} rotation={obj.rotation} scale={obj.scale}>
              {obj.children.map((child, index) => {
                return <mesh
                  key={index}
                  geometry={child.geometry}
                  position={child.position}
                  rotation={child.rotation}
                  scale={child.scale}
                >
                  <meshPhysicalMaterial
                    {...props}
                    emissive={new THREE.Color(0x000000)}
                    specularIntensity={0.5}
                    ior={1.45}
                    iridescence={0}
                    iridescenceIntensity={1.1}
                    sheen={1}
                    reflectivity={0.62}
                    roughness={1}
                  />
                </mesh>
              })}
            </group>

        })
      }
      <BaseFrame />
    </group>

  )
}


