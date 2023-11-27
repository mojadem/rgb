precision mediump float;

uniform sampler2D u_texture;
uniform int u_color;

varying vec2 textureCoord;

void main()
{
    vec4 texColor = texture2D(u_texture, textureCoord);

    vec4 outColor = vec4(0., 0., 0., 1.);

    float maxColor = max(texColor.r, texColor.g);
    maxColor = max(maxColor, texColor.b);

    if (texColor[u_color] == maxColor) {
        outColor[u_color] = texColor[u_color];
    }

    gl_FragColor = outColor; 
}    
