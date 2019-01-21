#version 300 es

in vec3 fs_Nor;
in vec3 fs_LightVec;

out vec4 out_Col;

void main()
{
    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
    diffuseTerm = clamp(diffuseTerm, 0, 1);
    // Using palette color
    vec3 paletteColor = vec3(0.5) + vec3(0.5) * cos(6.28318 * (vec3(1) * diffuseTerm + vec3(0, 0.33, 0.67)));

    out_Col = vec4(paletteColor, 1);
}

