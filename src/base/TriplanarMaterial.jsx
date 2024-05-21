import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { MeshPhysicalMaterial } from 'three';
import { useTexture } from '@react-three/drei';

extend({ MeshPhysicalMaterial });

const CustomShaderMaterial = React.forwardRef((props, ref) => {
    useEffect(() => {
        if (ref.current) {
            ref.current.onBeforeCompile = (shader) => {

                s.vertexShader = s.vertexShader.replace('#include <fog_vertex>', `
                #include <fog_vertex>
                #ifdef USE_MORPHTARGETS
                     vWorldPosition.xyz = transformed;  // Use the morph target "transformed" value
                     vWorldNormal.xyz = transformedNormal;
                    vViewDirection = cameraPosition - vWorldPosition;
                #endif
                `)


                // Inject custom vertex shader code for triplanar projection
                shader.vertexShader = `
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          ${shader.vertexShader}
        `.replace(
                    `#include <worldpos_vertex>`,
                    `#include <worldpos_vertex>
           vWorldPosition = worldPosition.xyz;
           vNormal = normalize(transformedNormal);`
                );

                // Inject custom fragment shader code for triplanar projection
                shader.fragmentShader = `
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          uniform sampler2D texture;

          vec3 triplanarMapping(vec3 pos, vec3 normal) {
            vec3 blending = abs(normal);
            blending = normalize(max(blending, 0.00001));
            blending /= dot(blending, vec3(1.0));

            vec3 xaxis = texture2D(texture, pos.yz).rgb;
            vec3 yaxis = texture2D(texture, pos.xz).rgb;
            vec3 zaxis = texture2D(texture, pos.xy).rgb;

            return xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;
          }

          ${shader.fragmentShader}
        `.replace(
                    `#include <map_fragment>`,
                    `#include <map_fragment>
           vec3 normal = normalize(vNormal);
           vec3 pos = vWorldPosition;
           vec4 triplanarColor = vec4(triplanarMapping(pos, normal), 1.0);
           diffuseColor *= triplanarColor;`
                );

                // Pass the texture uniform
                shader.uniforms.texture = { value: props.map };
            };
        }
    }, [ref, props.map]);

    return <meshPhysicalMaterial ref={ref} attach="material"
        morphTargets={true}
        {...props} />;
});

const MorphingMesh = () => {
    const meshRef = useRef();
    const materialRef = useRef();

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.morphTargetInfluences[0] = Math.abs(Math.sin(Date.now() * 0.001));
        }
    });
    const [map, normalMap, roughnessMap] = useTexture(['Oak_Rift_Dark_1_BaseColor.jpg', 'Oak_Rift_Dark_1_Normal.png', 'Oak_Rift_Dark_1_Roughness.jpg'])

    return (<CustomShaderMaterial ref={materialRef} map={map} />
    );
};
export default MorphingMesh;

