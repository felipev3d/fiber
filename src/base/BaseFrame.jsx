import { useGLTF, useTexture } from '@react-three/drei'
import { useControls } from 'leva'
import React, { useEffect, useRef } from 'react'
import CustomMaterialComponent from './CustomMaterialComponent';
import Triplannar from './Triplannar';


function BaseFrame() {
    const meshRef = useRef()

    const base = useGLTF('base/A10_BS_T7_48x26x10.gltf')

    const sliders = useControls(
        Object.keys(base.nodes.A10_BS_T7_48x26x10.children[0].morphTargetDictionary).reduce((acc, key) => {
            acc[key] = { value: 0, min: 0, max: 10 } // Define each slider
            return acc
        }, {})
    )

    return (
        <group >
            {
                base.nodes.A10_BS_T7_48x26x10.children.map((child, index) => <Mesher key={index} sliders={sliders} {...child} />)
            }
            <mesh
            castShadow={true}   
            receiveShadow={true}    
            >
                <planeGeometry args={[1, 1]}
                
                
                />
            </mesh>
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

    const { scalex, scaley, scalez } = useControls(
        {
            scalex: { value: 1, min: 0, max: 2 },
            scaley: { value: 1, min: 0, max: 2 },
            scalez: { value: 1, min: 0, max: 2 }
        }
    )


    return (
        <mesh ref={meshRef}
            scale={[scalex, scaley, scalez]}
            morphTargetInfluences={mesh.morphTargetInfluences}
            castShadow={true}
            receiveShadow={true}
            geometry={mesh?.geometry}  >
            {/* <BaseMaterial meshRef={meshRef} /> */}
            <CustomMaterialComponent morphTargetInfluences={mesh.morphTargetInfluences} />

            {/* <Triplannar /> */}
        </mesh>
    )
}

const BaseMaterial = ({ meshRef }) => {
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

    useEffect(() => {
        var uvAttribute = meshRef.current.geometry.attributes.uv;
        uvAttribute.needsUpdate = true;


        for (var i = 0; i < uvAttribute.count; i++) {

            var u = uvAttribute.getX(i);
            var v = uvAttribute.getY(i);

            // do something with uv

            // write values back to attribute

            uvAttribute.setXY(i, u, v);

        }
    }, [type])

    return (
        <meshPhysicalMaterial
            map={textures[0]}
            normalMap={textures[1]}
            roughnessMap={textures[2]}
        />
        // <CustomMaterialComponent />
    )
}


export default BaseFrame