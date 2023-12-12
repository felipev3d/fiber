import { useLoader } from '@react-three/fiber';
import { ShaderMaterial, TextureLoader, RepeatWrapping, SRGBColorSpace, NoColorSpace } from 'three';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import vertexShader from './Shaders/vertexShader.glsl';
import fragmentShader from './Shaders/fragmentShader.glsl';
 
const NoStShader = ({
    texture1Path,
    texture2Path,
    texture3Path,
    scale,
    ratio,
    ligthPosition

}) => {


    const texture1 = useLoader(TextureLoader, texture1Path); // base color
    texture1.colorSpace = SRGBColorSpace; // base color should be sRGB
    const texture2 = useLoader(TextureLoader, texture2Path); // normal map
    texture2.colorSpace = NoColorSpace; // normal map should be linear
    const texture3 = useLoader(TextureLoader, texture3Path); // roughness map
    texture3.colorSpace = NoColorSpace; // roughness map should be linear


    const lightPos3js = ligthPosition.map((pos) => new THREE.Vector3(pos[0], pos[1], pos[2]));


    // Make the textures tileable

    [texture1, texture2, texture3
    ].forEach(tex => {
        tex.wrapS = tex.wrapT = RepeatWrapping;
    });

    // Define scaling factors (you can adjust these as needed)
    const scale1 = new THREE.Vector2(ratio * scale, scale);

    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                baseText: { value: texture1 },
                normalText: { value: texture2 },
                roughnessMap: { value: texture3 },

                scale1: {
                    value: scale1
                },
                lightColors: {
                    type: "v3v",
                    value: [
                        new THREE.Vector3(1.0, 1.0, 1.0),
                        new THREE.Vector3(1.0, 1.0, 1.0),
                        new THREE.Vector3(1.0, 1.0, 1.0),
                        // new THREE.Vector3(1.0, 1.0, 1.0),

                    ]
                },
                lightPositions: {
                    type: "v3v",
                    value: lightPos3js
                },
                albedoMap: {
                    type: "t", value: texture1
                },
                normalMap: {
                    type: "t",
                    value: texture2
                },
                roughnessMap: {
                    type: "t",
                    value: texture3
                },
                exposure: { type: "f", value: 2.2 },


            },
            vertexShader: vertexShader,
            fragmentShader:
                fragmentShader,
        });
    }, [
        texture1,
        texture2,
        texture3,
        scale1,




    ]);


    shaderMaterial.side = THREE.DoubleSide;
    return <primitive object={shaderMaterial} attach="material" />;
};

export default NoStShader;
