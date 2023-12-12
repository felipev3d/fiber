  // Function to decode normal map
vec3 decodeNormalMap(vec3 encodedNormal) {
    encodedNormal = encodedNormal * 2.0 - 1.0; // Remap from [0, 1] to [-1, 1]
            // Assuming z was not stored directly and needs to be derived
    encodedNormal.z = sqrt(1.0 - encodedNormal.x * encodedNormal.x - encodedNormal.y * encodedNormal.y);
    return normalize(encodedNormal); // Normalize the vector
}
        // Function to blend an array of normals with an array of weights (blend factors).
        // The weights should sum up to 1.0 to maintain proper normal vector length.
vec3 blendMultipleNormals(vec3 normals[4], float weights[4]) {
    vec3 blendedNormal = vec3(0.0, 0.0, 0.0);
    float totalWeight = 0.0;

    for(int i = 0; i < 4; ++i) {
        blendedNormal += normals[i] * weights[i];
        totalWeight += weights[i];
    }

            // Normalize to account for any minor numerical discrepancies in the weights
    if(totalWeight > 0.0) {
        blendedNormal /= totalWeight;
    }

    return normalize(blendedNormal);
}
// Easy trick to get tangent-normals to world-space to keep PBR code simplified.
// Don't worry if you don't get what's going on; you generally want to do normal
// mapping the usual way for performance anways; I do plan make a note of this
// technique somewhere later in the normal mapping tutorial.
vec3 getNormalFromMap(
    sampler2D normalMap,
    sampler2D stuv1Normal,
    sampler2D stuv2Normal,
    sampler2D stuv3Normal,
    vec2 vUv,
    vec2 vUv1,
    vec2 vUv2,
    vec2 vUv3,
    vec2 scale1,
    vec3 WorldPos,
    vec3 Normal
) {
    // vec3 tangentNormal = texture(normalMap, vUv * scale1).xyz * 2.0 - 1.0;

    vec3 Q1 = dFdx(WorldPos);
    vec3 Q2 = dFdy(WorldPos);
    vec2 st1 = dFdx(vUv);
    vec2 st2 = dFdy(vUv);

    vec3 N = normalize(Normal);
    vec3 T = normalize(Q1 * st2.t - Q2 * st1.t);
    vec3 B = -normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);
// Define fixed-size arrays of normals and their corresponding blend weights
    vec3 normals[4];
    float weights[4];

            // Sample and decode the normal maps
    normals[0] = decodeNormalMap(texture(normalMap, scale1 * vUv).rgb);
    normals[1] = decodeNormalMap(texture(stuv1Normal, vUv1).rgb);
    normals[2] = decodeNormalMap(texture(stuv2Normal, vUv2).rgb);
    normals[3] = decodeNormalMap(texture(stuv3Normal, vUv3).rgb);

            // Assign you1.0lend weights here
    weights[0] = 0.25; // Replace with your actual blend weights
    weights[2] = 0.25;
    weights[1] = 0.25;
    weights[3] = 0.25;
            // Blend the normals
    vec3 blendedNormal = blendMultipleNormals(normals, weights);

   // vec3 normal = normalize(TBN * tangentNormal);
    vec3 normal = normalize(TBN * blendedNormal);
    return normal;

}
