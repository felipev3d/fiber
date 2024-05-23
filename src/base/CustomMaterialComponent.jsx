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
     vWorldPosition.xyz =   transformed;  
     vWorldNormal.xyz =  normalize(mat3(modelMatrix) * normal);
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
    
                vec3 scaledCoords = vWorldPosition * 2.0;
                vec2 uvX = scaledCoords.yz;
                vec2 uvY = scaledCoords.xz;
                vec2 uvZ = scaledCoords.xy;
        
                // Calculate blending weights
                float wX = abs(vWorldNormal.x);
                float wY = abs(vWorldNormal.y);
                float wZ = abs(vWorldNormal.z);
        
                // Normalize weights
                float sumW = wX + wY + wZ;
                wX /= sumW;
                wY /= sumW;
                wZ /= sumW;
        
                // Sample textures
                vec4 texColorX = texture2D(map, uvX);
                vec4 texColorY = texture2D(map, uvY);
                vec4 texColorZ = texture2D(map, uvZ);
        
                // Blend textures based on weights
                vec4 blendedColor = texColorX * wX + texColorY * wY + texColorZ * wZ;
                vec4 sampledDiffuseColor = blendedColor;
                //vec4 sampledDiffuseColor `
            );
            injectChunk(
                s,
                "fragmentShader",
                "normal_fragment_maps",
                `normal = normalize( normalMatrix * normal );`,
                `
            // Calculate triplanar texture coordinates and weights
            vec3 scaledCoords = vWorldPosition * textureScale;
            vec2 uvX = scaledCoords.yz;
            vec2 uvY = scaledCoords.xz;
            vec2 uvZ = scaledCoords.xy;
            float wX = abs(normalize(vWorldNormal).x);
            float wY = abs(normalize(vWorldNormal).y);
            float wZ = abs(normalize(vWorldNormal).z);
            float sumW = wX + wY + wZ;
            wX /= sumW;
            wY /= sumW;
            wZ /= sumW;
          
            // Sample normal maps for each plane
            vec3 normX = texture2D(normalMap, uvX).xyz * 2.0 - 1.0;
            vec3 normY = texture2D(normalMap, uvY).xyz * 2.0 - 1.0;
            vec3 normZ = texture2D(normalMap, uvZ).xyz * 2.0 - 1.0;
          
            // Adjust normals from tangent to world space (assuming Y-up coordinate system)
            vec3 nX = vec3(0, normX.z, normX.y);
            vec3 nY = vec3(normY.x, 0, normY.z);
            vec3 nZ = vec3(normZ.x, normZ.y, 0);
          
            // Blend the normals based on the calculated weights
            vec3 blendedNormal = normalize(nX * wX + nY * wY + nZ * wZ);
          
            // Assign the blended normal to normal vector used by the rest of the shader
            normal = blendedNormal;
            `
            );


            const _sc = 1.2
            s.uniforms.textureScale = { value: new Vector3(_sc, _sc, _sc) };
            // s.uniforms.normalMap = { value: normalMap };
            // // s.uniforms.roughnessMap = { value: roughnessMap };
            console.log(s.fragmentShader)
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
