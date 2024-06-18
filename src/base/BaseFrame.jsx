import { useGLTF, useTexture } from '@react-three/drei'
import { useControls } from 'leva'
import React, { useEffect, useRef } from 'react'
import CustomMaterialComponent from './CustomMaterialComponent';


function BaseFrame() {
    const meshRef = useRef()

    const base = useGLTF('A10_BS_T18_48x26x10.glb')
    console.log("🚀 ~ BaseFrame ~ base:", base)

    const sliders = useControls(
        Object.keys(base.nodes.A10_BS_T18_48x26x10.children[0].morphTargetDictionary).reduce((acc, key) => {
            acc[key] = { value: 0, min: 0, max: 10 } // Define each slider
            return acc
        }, {})
    )

    return (
        <group
            castShadow={true}
            receiveShadow={true}
            position-y={0.16}
            position-z={0.09}
        >
            {
                base.nodes.A10_BS_T18_48x26x10.children.map((child, index) => <Mesher key={index} sliders={sliders} {...child} />)
            }
            <mesh
                castShadow={true}
                receiveShadow={true}
                position={[-.13, .2, .2]}
            >
                <sphereGeometry args={[.1, 32, 32]} />
                castShadow={true}
                receiveShadow={true}

                args={[.1, .1, .1]}

                <meshPhysicalMaterial color={'pink'} />
            </mesh>
            <mesh
                castShadow={true}
                receiveShadow={true}
                position={[.63, .0, -.25]}
            >
                <sphereGeometry args={[.1, 32, 32]} />
                castShadow={true}
                receiveShadow={true}

                args={[.1, .1, .1]}

                <meshPhysicalMaterial color={'pink'} />
            </mesh>
        </group >
    )
}


const Mesher = (mesh) => {
    console.log("🚀 ~ Mesher ~ mesh:", mesh)
    const dict = {
        "Y1": 0,
        "Y11": 1,
        "Y1A2": 2,
        "Y0": 3,
        "Y00": 4,
        "X1R": 5,
        "X11R": 6,
        "X1L": 7,
        "X11L": 8,
        "Z1": 9,
        "Z11": 10,
        "Z111": 11
    }
    const meshRef = useRef()

    const { sliders } = mesh



    Object.keys(dict).forEach((key) => {
        mesh.morphTargetInfluences[dict[key]] = sliders[key]
    }
    )

    const { scalex, scaley, scalez } = useControls(
        {
            scalex: { value: 1, min: 0, max: 2 },
            scaley: { value: 1, min: 0, max: 2 },
            scalez: { value: 1, min: 0, max: 2 }
        }
    )

    useEffect(() => {
        mesh.geometry.computeVertexNormals()
        mesh.geometry.computeTangents();

 
    }, [mesh.morphTargetInfluences])
    return (
        <mesh ref={meshRef}
            scale={[scalex, scaley, scalez]}
            morphTargetInfluences={mesh.morphTargetInfluences}
            castShadow={true}
            receiveShadow={true}

            geometry={mesh?.geometry}
        >
            <CustomMaterialComponent morphTargetInfluences={mesh.morphTargetInfluences} />

        </mesh>
    )
}




export default BaseFrame