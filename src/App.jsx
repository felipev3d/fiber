
import * as THREE from 'three'
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import BaseFrame from './base/baseFrame'
import { CameraControls, Environment } from '@react-three/drei'






export default function App() {



  return (
    <>
      <Canvas
      // renderer={{ antialias: true }}
      // shadows camera={{ position: [0, 0, 3], fov: 20 }}
      >
        <pointLight position={[10, 10, 10]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 0, 5]} intensity={1} />
        <Environment background={true} preset="warehouse" />
        <BaseFrame />
        <CameraControls />

      </Canvas >
    </>

  )
}








