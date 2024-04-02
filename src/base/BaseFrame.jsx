import { useGLTF } from '@react-three/drei'
import React, { useRef } from 'react'

function BaseFrame() {
    const meshRef = useRef()

    const base = useGLTF('base/A10_BS_T7_48x26x10.gltf')
    console.log("🚀 ~ BaseFrame ~ base:", base.scene.children[0])

    return (
        <group ref={meshRef} dispose={null}>
            {
                base.scene.children[0].children.map((child, index) => {
                    return (
                        <primitive key={index} object={child } />
                    )
                })
            }
        </group>
    )
}





export default BaseFrame