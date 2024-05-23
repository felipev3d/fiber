import { useTexture } from '@react-three/drei'
import React, { useMemo, useRef } from 'react'
import { RepeatWrapping, ShaderChunk, Vector3 } from 'three'

let injectChunk = (shader, seg, chunk, find, replace) => {
    let ck = ShaderChunk[chunk];
    shader[seg] = shader[seg].replace(
        `#include <${chunk}>`,
        ck.replace(find, replace)
    );
};

function CustomMaterialComponent({ morphTargetInfluences }) {

    const materialRef = useRef()
    const [map, normalMap, roughnessMap] = useTexture(['Oak_Rift_Dark_1_BaseColor.jpg', 'Oak_Rift_Dark_1_Normal.png', 'Oak_Rift_Dark_1_Roughness.jpg'])

    const props = useMemo(() => {
        let shader;
        map.wrapS = map.wrapT = RepeatWrapping;
        normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
        // normalMap.rotation = Math.PI / 2;
        roughnessMap.wrapS = roughnessMap.wrapT = RepeatWrapping;
        // roughnessMap.rotation = Math.PI / 2;

        let onBeforeCompile = (s) => {
            s.vertexShader =
                `
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
            ` + s.vertexShader;

            s.vertexShader = s.vertexShader.replace('#include <fog_vertex>', `
#include <fog_vertex>
#ifdef USE_MORPHTARGETS
     vWorldPosition.xyz = transformed;  // Use the morph target "transformed" value
     vWorldNormal.xyz = transformedNormal;
    vViewDirection = cameraPosition - vWorldPosition;
#endif 
`)

            s.fragmentShader =
                `
        uniform vec3 textureScale; 
        
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        ` + s.fragmentShader;

            injectChunk(
                s,
                "vertexShader",
                "begin_vertex",
                `#ifdef USE_ALPHAHASH`,
                `
        {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            vViewDirection = cameraPosition - vWorldPosition;
        }
        #ifdef USE_ALPHAHASH
            `
            );

            injectChunk(
                s,
                "fragmentShader",
                "map_fragment",
                `vec4 sampledDiffuseColor`,
                `
          vec3 scaledCoords = vWorldPosition * textureScale;
    
          vec2 uv;
          if (abs(vWorldNormal.y) > 0.5) {
              uv = scaledCoords.xz;
          } else if (abs(vWorldNormal.x) > 0.5) {
              uv = scaledCoords.yz;
          } else {
              uv = scaledCoords.xy;
          }
          vec4 sampledDiffuseColor = texture2D( map, uv );            
          //vec4 sampledDiffuseColor `
            );
            injectChunk(
                s,
                "fragmentShader",
                "roughnessmap_fragment",
                `vec4 texelRoughness
                float roughnessFactor = roughness; `,
                `
                
          vec4 texelRoughness = texture2D( roughnessMap, uv );
          roughnessFactor *= texelRoughness.g;`
            );


            injectChunk(
                s,
                "fragmentShader",
                "normal_fragment_maps",
                `
                //vec4 texelRoughness
                // float roughnessFactor = roughness; `,
                `
                
                normal = texture2D( normalMap, uv ).xyz * 2.0 - 1.0;
                normal = normalize( normalMatrix * normal );
          `
            );

            const _sc = 1.2
            s.uniforms.textureScale = { value: new Vector3(_sc, _sc, _sc) };
            s.uniforms.normalMap = { value: normalMap };
            s.uniforms.roughnessMap = { value: roughnessMap };
        };

        return {
            ref: materialRef,
            map: map,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
            onBeforeCompile: onBeforeCompile,
            customProgramCacheKey: () => 456,
        }

    }, [map, normalMap, roughnessMap])


    return (
        <meshPhysicalMaterial
            {...props}
        />
    )
}

export default CustomMaterialComponent
