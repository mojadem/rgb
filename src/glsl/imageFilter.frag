precision mediump float;

uniform sampler2D u_texture;
uniform int u_color;
uniform vec3 u_tint;

varying vec2 textureCoord;

void main()
{
    vec4 texColor = texture2D(u_texture, textureCoord);

    texColor.r = texColor.r - (1. - u_tint.r);
    texColor.g = texColor.g - (1. - u_tint.g);
    texColor.b = texColor.b - (1. - u_tint.b);

    vec4 outColor = vec4(0., 0., 0., 0.);

    float maxColor = max(texColor.r, texColor.g);
    maxColor = max(maxColor, texColor.b);

    if (texColor[u_color] == maxColor) {
        outColor[u_color] = texColor[u_color];
        outColor.a = 1.;
    }

    gl_FragColor = outColor; 
}    
