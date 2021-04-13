// precision mediump float;

// varying float vRandom;
varying vec2 vUv;
varying float vElevetion;

uniform vec3 uColor;
uniform sampler2D uTexture;

void main() {
    vec4 textureColor = texture2D(uTexture, vUv);
    textureColor.rgb *= vElevetion * 0.4 + 0.6;
    // gl_FragColor = vec4(vRandom, vRandom, 1.0, 0.0);
    // gl_FragColor = vec4(uColor.r, uColor.g, uColor.b, 0.0);
    gl_FragColor = textureColor;
    
}