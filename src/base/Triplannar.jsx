import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { texture, uv, float, vec2, color, vec3, vec4, oscSine, triplanarTexture, viewportBottomLeft, js, string, global, loop, MeshBasicNodeMaterial, NodeObjectLoader } from 'three/nodes';





function Triplannar() {
    let material;
    const myTexture = useTexture('Oak_Rift_Dark_1_BaseColor.jpg')

    material = new MeshBasicNodeMaterial({
        colorNode: triplanarTexture(texture(myTexture)).add(color(0x0066ff)).mul(.8)
    });


    return <primitive object={material} attach="material" />
}

export default Triplannar