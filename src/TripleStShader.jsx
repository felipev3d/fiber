import { extend, useLoader } from '@react-three/fiber';
import { ShaderMaterial, TextureLoader, RepeatWrapping, NearestFilter, LinearSRGBColorSpace, SRGBColorSpace, NoColorSpace } from 'three';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import vertexShader from './Shaders/vertexShader.glsl';
import fragmentShader from './Shaders/fragmentShader.glsl';
import fragmentShader2 from './Shaders/fragment2.glsl';
const aopath = "/ao.png"
const metallicpath = "/metallic.png";
const TripleStShader = ({
    materialPaths,
    stPats,
    scale,
    ratio,
    ligthPosition

}) => {
    const [texture1Path, texture2Path, texture3Path] = materialPaths;
    const [stC, stN] = stPats;
    const stuv1BaseColorPath = stC;
    const stuv1NormalPath = stN;
    // const stuv2BaseColorPath = stC;
    // const stuv2NormalPath = stN;
    // const stuv3BaseColorPath = stC;
    // const stuv3NormalPath = stN;
    // const stuv4BaseColorPath = stC;
    // const stuv4NormalPath = stN;

    const texture1 = useLoader(TextureLoader, texture1Path); // base color
    texture1.colorSpace = SRGBColorSpace; // base color should be sRGB
    const texture2 = useLoader(TextureLoader, texture2Path); // normal map
    texture2.colorSpace = NoColorSpace; // normal map should be linear
    const texture3 = useLoader(TextureLoader, texture3Path); // roughness map
    texture3.colorSpace = NoColorSpace; // roughness map should be linear
    const aoMap = useLoader(TextureLoader, aopath); // roughness map
    const metallicMap = useLoader(TextureLoader, metallicpath); // roughness map

    // Additional UV maps and textures
    const stuv1BaseColor = useLoader(TextureLoader, stuv1BaseColorPath);
    const stuv1Normal = useLoader(TextureLoader, stuv1NormalPath);
    const stuv2BaseColor = stuv1BaseColor
    const stuv2Normal = stuv1Normal
    const stuv3BaseColor = stuv1BaseColor
    const stuv3Normal = stuv1Normal
    const stuv4BaseColor = stuv1BaseColor
    const stuv4Normal = stuv1Normal
    stuv1BaseColor.colorSpace = NoColorSpace;
    stuv1Normal.colorSpace = NoColorSpace;
    stuv2BaseColor.colorSpace = NoColorSpace;
    stuv2Normal.colorSpace = NoColorSpace;
    stuv3BaseColor.colorSpace = NoColorSpace;
    stuv3Normal.colorSpace = NoColorSpace;
    stuv4BaseColor.colorSpace = NoColorSpace;
    stuv4Normal.colorSpace = NoColorSpace;



    const lightPos3js = ligthPosition.map((pos) => new THREE.Vector3(pos[0], pos[1], pos[2]));


    // Make the textures tileable

    [texture1, texture2, texture3, stuv1BaseColor, stuv1Normal,
        aoMap, metallicMap,
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
                stuv1BaseColor: { value: stuv1BaseColor },
                stuv1Normal: { value: stuv1Normal },
                stuv2BaseColor: { value: stuv2BaseColor },
                stuv2Normal: { value: stuv2Normal },
                stuv3BaseColor: { value: stuv3BaseColor },
                stuv3Normal: { value: stuv3Normal },
                stuv4BaseColor: { value: stuv4BaseColor },
                stuv4Normal: { value: stuv4Normal },
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
            fragmentShader:     fragmentShader,
        });

       

    }, [
        texture1,
        texture2,
        texture3,
        stuv1BaseColor,
        stuv1Normal,
        stuv2BaseColor,
        stuv2Normal,
        stuv3BaseColor,
        stuv3Normal,
        stuv4BaseColor,
        stuv4Normal,
        scale1,




    ]);


    shaderMaterial.side = THREE.DoubleSide;
    return <primitive object={shaderMaterial} attach="material" />;
};

export default TripleStShader;
