import { useGLTF, useTexture } from '@react-three/drei'
import { useControls } from 'leva'
import React, { useRef } from 'react'

function BaseFrame() {
    const meshRef = useRef()

    const base = useGLTF('base/A10_BS_T7_48x26x10.gltf')
    console.log("🚀 ~ BaseFrame ~ base:",)

    const sliders = useControls(
        Object.keys(base.nodes.A10_BS_T7_48x26x10.children[0].morphTargetDictionary).reduce((acc, key) => {
            acc[key] = { value: 0, min: 0, max: 10 } // Define each slider
            return acc
        }, {})
    )
    console.log("🚀 ~ BaseFrame ~ sliders:", sliders)

    return (
        <group >
            {
                base.nodes.A10_BS_T7_48x26x10.children.map((child, index) => <Mesher key={index} sliders={sliders} {...child} />)
            }
        </group >
    )
}


const Mesher = (mesh) => {
    const dict = {
        "Y1": 0,
        "Y1A": 1,
        "Y0": 2,
        "X1R": 3,
        "X1L": 4,
        "Z1": 5,
        "Z11": 6
    }
    const meshRef = useRef()

    const { sliders } = mesh

  
    Object.keys(dict).forEach((key) => {
        mesh.morphTargetInfluences[dict[key]] = sliders[key]
    }
    )


    return (
        <mesh ref={meshRef} morphTargetInfluences={mesh.morphTargetInfluences} geometry={mesh?.geometry}  >
            <BaseMaterial />
        </mesh>
    )
}

const BaseMaterial = () => {
    const { type } = useControls({
        type: {
            options: {
                Type1: [
                    'Oak_Rift_Dark_1_BaseColor.jpg',
                    'Oak_Rift_Dark_1_Normal.png',
                    'Oak_Rift_Dark_1_Roughness.jpg',
                ], Type2: [
                    'Driftwood_8200k-16_BaseColor.jpg',
                    'Vellum_Normal.png',
                    'Vellum_Roughness.jpg',
                ]
            },
        },
    })

    const textures = useTexture(type)
    return (
        <meshPhysicalMaterial
            map={textures[0]}
            normalMap={textures[1]}
            roughnessMap={textures[2]}
        />
    )
}


export default BaseFrame