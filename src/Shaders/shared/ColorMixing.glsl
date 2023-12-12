// Function to create noise

vec3 BlendMaps(
    vec2 vUv,
    vec2 vUv1,
    vec2 vUv2,
    vec2 vUv3,
    vec2 scale1,
    sampler2D albedoMap,
    sampler2D stuv1BaseColor,
    sampler2D stuv2BaseColor,
    sampler2D stuv3BaseColor

) {
    vec2 scaledUV1 = vUv * scale1;

    // Adding color variation
    vec3 color = mix(vec3(0.8, 0.7, 0.6), vec3(1.0, 0.0, 0.0), 0.68);

    // Simple lighting effect
    float lighting = dot(normalize(vec3(0.0, 0.0, 1.0)), normalize(vec3(0.5, 0.5, 1.0)));
    color *= lighting;

            // Sample the base color maps
    vec4 baseColor = texture(albedoMap, scaledUV1);
    vec4 baseColor1 = texture(stuv1BaseColor, vUv1);
    vec4 baseColor2 = texture(stuv2BaseColor, vUv2);
    vec4 baseColor3 = texture(stuv3BaseColor, vUv3);

            // Blend the base colors (example)
    vec4 mixedBaseColor = mix(baseColor, vec4(color, 1), baseColor1.r); // You can replace 0.5 with your own blend factor
    mixedBaseColor += mix(mixedBaseColor, vec4(color, 1), baseColor2.r); // You can replace 0.5 with your own blend factor
    mixedBaseColor += mix(mixedBaseColor, vec4(color, 1), baseColor3.r); // You can replace 0.5 with your own blend factor

    return mixedBaseColor.rgb;
}