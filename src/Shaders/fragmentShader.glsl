const float PI = 3.14159265359;
#include "./shared/DistributionGGX.glsl"
#include "./shared/ColorMixing.glsl"
#include "./shared/NormalMixing.glsl"
precision highp float;
varying vec3 WorldPos;
varying vec3 Normal;
varying vec2 vUv;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
uniform sampler2D stuv1BaseColor; // Base color for STuv1
uniform sampler2D stuv1Normal; // Normal map for STuv1
uniform sampler2D stuv2BaseColor; // Base color for STuv2
uniform sampler2D stuv2Normal; // Normal map for STuv2
uniform sampler2D stuv3BaseColor; // Base color for STuv3
uniform sampler2D stuv3Normal; // Normal map for STuv3 
// material parameters
uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D roughnessMap;
uniform vec2 scale1;
// lights
uniform vec3 lightPositions[3];
uniform vec3 lightColors[3];
uniform float exposure;
 
// ----------------------------------------------------------------------------

void main() {

    vec3 albedo = pow(BlendMaps(vUv, vUv1, vUv2, vUv3, scale1, albedoMap, stuv1BaseColor, stuv2BaseColor, stuv3BaseColor), vec3(1.5));
    float metallic = 0.0;//texture(metallicMap, vUv * 1.0).r;
    float roughness = texture(roughnessMap, vUv * scale1).r * 1.0;
    float ao = 0.0;//texture(aoMap, vUv * 10.0).r;

    vec3 N = getNormalFromMap(normalMap, stuv1Normal, stuv2Normal, stuv3Normal, vUv, vUv1, vUv2, vUv3, scale1, WorldPos, Normal);
    vec3 V = normalize(cameraPosition - Normal);

    // calculate reflectance at normal incidence; if dia-electric (like plastic) use F0
    // of 0.04 and if it's a metal, use the albedo color as F0 (metallic workflow)
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);

    // reflectance equation
    vec3 Lo = vec3(0.0);
    for(int i = 0; i < 3; ++i) {
        // calculate per-light radiance
        vec3 L = normalize(lightPositions[i] - WorldPos);
        vec3 H = normalize(V + L);
        float distance = length(lightPositions[i] - WorldPos);
        float attenuation = 3.0 / (distance * distance);
        vec3 radiance = lightColors[i] * attenuation;

        // Cook-Torrance BRDF
        float NDF = DistributionGGX(N, H, roughness);
        float G = GeometrySmith(N, V, L, roughness);
        vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

        vec3 nominator = NDF * G * F;
        float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001; // 0.001 to prevent divide by zero.
        vec3 specular = nominator / denominator;

        // kS is equal to Fresnel
        vec3 kS = F;
        // for energy conservation, the diffuse and specular light can't
        // be above 1.0 (unless the surface emits light); to preserve this
        // relationship the diffuse component (kD) should equal 1.0 - kS.
        vec3 kD = vec3(1.0) - kS;
        // multiply kD by the inverse metalness such that only non-metals
        // have diffuse lighting, or a linear blend if partly metal (pure metals
        // have no diffuse light).
        kD *= 1.0 - metallic;

        // scale light by NdotL
        float NdotL = max(dot(N, L), 0.0);

        // add to outgoing radiance Lo
        Lo += (kD * albedo / PI + specular) * radiance * NdotL;  // note that we already multiplied the BRDF by the Fresnel (kS) so we won't multiply by kS again
    }

    // ambient lighting (note that the next IBL tutorial will replace
    // this ambient lighting with environment lighting).
    vec3 ambient = vec3(0.03) * albedo * ao;

    vec3 color = ambient + Lo;

    // HDR tonemapping
    color = color / (color + vec3(1.0));
    // gamma correct
    color = pow(color, vec3(1.0 / exposure));
    gl_FragColor = vec4(color, 1.0);
}
