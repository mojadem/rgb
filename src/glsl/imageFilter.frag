precision mediump float;

uniform sampler2D u_texture;
uniform int u_color;

varying vec2 textureCoord;

void main()
{
    vec4 texColor = texture2D(u_texture, textureCoord);

    vec4 outColor = vec4(0., 0., 0., 0.);

    float maxColor = max(texColor.r, texColor.g);
    maxColor = max(maxColor, texColor.b);

    if (texColor[u_color] == maxColor) {
        outColor[u_color] = texColor[u_color];
        outColor.a = 1.;
    }

    if (texColor.r == texColor.g && texColor.g == texColor.b && texColor.r == texColor.b) {
        outColor = texColor;
    }

    gl_FragColor = outColor; 
}    
