import { useTexture } from '@react-three/drei'
import React, { useMemo, useRef } from 'react'
import { FrontSide, RepeatWrapping, ShaderChunk, Vector3 } from 'three'
import { roughness } from 'three/examples/jsm/nodes/Nodes.js';

let injectChunk = (shader, seg, chunk, find, replace) => {
    let ck = ShaderChunk[chunk];
    shader[seg] = shader[seg].replace(
        `#include <${chunk}>`,
        ck.replace(find, replace)
    );
};

let obc=(s)=>{
    s.vertexShader = `// VERTEX TRIPLANAR VARYINGS 
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        varying vec3 vInitialCoords;
        varying vec3 vInitialNormal; 
        ` + s.vertexShader;

    s.vertexShader = s.vertexShader.replace('#include <fog_vertex>', `
#include <fog_vertex>
#ifdef USE_MORPHTARGETS
  vec3  vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
   vec3 vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);

    // Center the coordinates
    vec3 centeredCoords = worldPosition.xyz - vec3(0.0); // Adjust as necessary based on your model's coordinate space
    vec3 scaledCoords = centeredCoords * 2.0;

    // Calculate the inverse rotation matrix
    mat3 rotationMatrix = mat3(modelMatrix);
    mat3 inverseRotationMatrix = inverse(rotationMatrix);

    // Apply the inverse rotation to the world coordinates 
    vInitialCoords = inverseRotationMatrix * scaledCoords;
    vInitialNormal = inverseRotationMatrix * vWorldNormal;
     
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
    varying vec3 vInitialCoords; 
    varying vec3 vInitialNormal;
    ` + s.fragmentShader;

    injectChunk(
        s,
        "fragmentShader",
        "map_fragment",
        `vec4 sampledDiffuseColor`,
        `    
        vec3 initialCoords = vInitialCoords;
        vec3 bnormal = normalize(vInitialNormal);
    
        vec2 uv;
        const float desc = 0.707; // 0.7071067811865475
        if (abs(bnormal.x) >= desc) {
            uv = initialCoords.yz * vec2(1.0, sign(bnormal.x));
        } else if (abs(bnormal.y) >= desc) {
            uv = initialCoords.zx * vec2(1.0, sign(bnormal.y));
        } else {
            uv = initialCoords.xy * vec2(1.0, sign(bnormal.z));
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

function CustomMaterialComponent({ morphTargetInfluences }) {

    const materialRef = useRef()
    const [map, normalMap, roughnessMap] = useTexture(
        // ['Oak_Rift_Dark_1_BaseColor.jpg', 'Oak_Rift_Dark_1_Normal.png', 'Oak_Rift_Dark_1_Roughness.jpg']
        ['001_BaseColor.webp', '001_Normal.webp', '001_Roughness.webp']
        // ['001_BaseColor.jpeg', '001_Normal.png', '001_Roughness.jpeg']
    )

    const props = useMemo(() => {
        let shader;
        map.wrapS = map.wrapT = RepeatWrapping;
        normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
        roughnessMap.wrapS = roughnessMap.wrapT = RepeatWrapping;
        // map.rotation = Math.PI *.25;
        map.repeat.set(1,1);
        normalMap.repeat.set(1,1);
        roughnessMap.repeat.set(1,1);

        map.rotation = Math.PI /2;
        // normalMap.rotation = Math.PI /2;
        // roughnessMap.rotation = Math.PI /2;

        
        let onBeforeCompile = obc;
          
        return {
            ref: materialRef,
            map: map,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
            roughness: 1.0,
            onBeforeCompile: onBeforeCompile,
            customProgramCacheKey: () => 456,
        }

    }, [map, normalMap, roughnessMap])

    return (
        <meshPhysicalMaterial
            {...props}
            side={FrontSide}
        />
    )
}

export default CustomMaterialComponent




/*
uniform vec3 textureScale; 
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
*/  

            /*
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
*/

//const _sc = 1.2
//s.uniforms.textureScale = { value: new Vector3(_sc, _sc, _sc) };
// s.uniforms.normalMap = { value: normalMap };
// // s.uniforms.roughnessMap = { value: roughnessMap };
//console.log(s.fragmentShader)
