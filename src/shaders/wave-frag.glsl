#version 300 es

precision highp float;

uniform vec4 u_Color;
uniform float u_Time;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec;

out vec4 out_Col;

void main()
{
    float gradTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));

    float blue = (0.5 + 0.5 * cos(6.28318 * (u_Time * 0.01))) * clamp(gradTerm, 0.0, 1.0);
    float green = (0.5 + 0.5 * cos(6.28318 * (u_Time * 0.02))) * blue;

    vec4 diffuseColor = vec4(-clamp(gradTerm, -1.0, 0.0), green, blue, 1.0);
    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));

    float lightIntensity = clamp(diffuseTerm, 0.0, 1.0) + 0.2;


    //vec4 spreadDir = vec4(1, 0, 0, 0);
    //vec4 planeCenter = vec4(-1, 0, 0, 1);
    vec4 spreadDir = normalize(fs_LightVec);
    vec4 planeCenter = vec4(5, 5, 3, 1);
    float stripe = 0.5 + 0.5 * pow(clamp(cos(dot(fs_Pos - planeCenter, spreadDir) * 100.0), 0.0, 1.0), 10.0);

    out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a) * vec4(vec3(stripe), 1);
}