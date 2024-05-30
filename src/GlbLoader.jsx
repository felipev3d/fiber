import { useGLTF } from '@react-three/drei'
import React, { useEffect } from 'react'
import { FrontSide, RepeatWrapping, ShaderChunk, Vector3 } from 'three'
let obc = (s) => {
    s.vertexShader = `// VERTEX TRIPLANAR VARYINGS 
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        ` + s.vertexShader;

    s.vertexShader = s.vertexShader.replace('#include <fog_vertex>', `
#include <fog_vertex>
#ifdef USE_MORPHTARGETS
     vWorldPosition.xyz =   transformed;  
     vWorldNormal.xyz =  normalize(mat3(modelMatrix) * objectNormal);
#endif
`)
    injectChunk(
        s,
        "vertexShader",
        "begin_vertex",
        `#ifdef USE_ALPHAHASH`,
        `{
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            vViewDirection = cameraPosition - vWorldPosition;

    #ifdef USE_METALNESSMAP
        vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
    #endif
    #ifdef USE_ROUGHNESSMAP
        vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
    #endif
        }
        #ifdef USE_ALPHAHASH
    `
    );

    s.fragmentShader = //FRAGMENT TRIPLANAR VARYINGS
        `
    uniform mat3 mapTransform;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;
    ` + s.fragmentShader;

    injectChunk(
        s,
        "fragmentShader",
        "map_fragment",
        `vec4 sampledDiffuseColor`,
        `    
        vec3 scaledCoords = vWorldPosition * 2.0;

        vec2 uv;
        const float desc=0.707;//1067811865475;
        if (abs(vWorldNormal.x) >= desc) {
            uv = scaledCoords.yz * vec2(1.,sign(vWorldNormal.x));
        } else if (abs(vWorldNormal.y) >= desc) {
            uv = scaledCoords.zx * vec2(1.,sign(vWorldNormal.y));
        } else  {
            uv = scaledCoords.yx * vec2(1.,-sign(vWorldNormal.z));
        }
        uv = ( mapTransform * vec3( uv, 1. ) ).xy;
        vec4 sampledDiffuseColor = texture2D( map, uv ); //`
    );

    injectChunk( // PATCH ROUGHNESS FRAGMENT
        s,
        "fragmentShader",
        "roughnessmap_fragment",
        `vec4 texelRoughness`,
        `
vec4 texelRoughness = texture2D( roughnessMap, uv );
roughnessFactor *= texelRoughness.g;  //`
    );

    injectChunk( // PATCH NORMALMAP FRAGMENT
        s,
        "fragmentShader",
        "normal_fragment_maps",
        `#elif defined( USE_NORMALMAP_TANGENTSPACE )`,
        `
#elif defined( USE_NORMALMAP_TANGENTSPACE )
vec2 vNormalMapUv = uv;
`
    );
}
function GlbLoader() {
    let model = useGLTF('test.glb')

    useEffect(() => {
       


        model.scene.traverse((child) => {
            if (child.isMesh) {

                console.log("🚀 ~ model.scene.traverse ~   child.material :", child.material.userData)
                if (child.material.userData.material === "Lam") {
                    child.material.onBeforeCompile = (shader) => {

                        obc(shader)
                    }
                }
            }
        })



    }, [model])


    return (

        <primitive object={model.scene} scale={1} />
    )
}

export default GlbLoader

let injectChunk = (shader, seg, chunk, find, replace) => {
    let ck = ShaderChunk[chunk];
    shader[seg] = shader[seg].replace(
        `#include <${chunk}>`,
        ck.replace(find, replace)
    );
};