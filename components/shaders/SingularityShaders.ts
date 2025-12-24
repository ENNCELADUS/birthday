import * as THREE from 'three'

export const ParticleShader = {
    uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPhase: { value: 0 }, // 0: IMPLOSION, 1: SHOCKWAVE, 2: CONSTELLATION
        uColor1: { value: new THREE.Color('#ffffff') }, // Gold
        uColor2: { value: new THREE.Color('#ffcc33') }, // Deep Gold
        uResolution: { value: new THREE.Vector2() },
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vAlpha;
        
        uniform float uTime;
        uniform float uProgress;
        uniform float uPhase;
        
        attribute vec3 aTarget;
        attribute float aSize;
        attribute float aOffset;
        
        // Simplex 3D Noise 
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 =   v - i + dot(i, C.xxx) ;

            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );

            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;

            i = mod289(i);
            vec4 p = permute( permute( permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

            float n_ = 0.142857142857;
            vec3  ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );

            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );

            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);

            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                            dot(p2,x2), dot(p3,x3) ) );
        }

        vec3 curlNoise(vec3 p) {
            float d = 0.01;
            vec3 dx = vec3(d, 0.0, 0.0);
            vec3 dy = vec3(0.0, d, 0.0);
            vec3 dz = vec3(0.0, 0.0, d);

            float n1 = snoise(p + dy) - snoise(p - dy);
            float n2 = snoise(p + dz) - snoise(p - dz);
            float n3 = snoise(p + dz) - snoise(p - dz);
            float n4 = snoise(p + dx) - snoise(p - dx);
            float n5 = snoise(p + dx) - snoise(p - dx);
            float n6 = snoise(p + dy) - snoise(p - dy);

            return vec3(n1 - n2, n3 - n4, n5 - n6);
        }

        void main() {
            vec3 pos = position;
            
            if (uPhase < 0.5) { // IMPLOSION
                pos = mix(pos, vec3(0.0), uProgress);
            } else if (uPhase < 1.5) { // SHOCKWAVE / DUST
                vec3 noise = curlNoise(pos * 0.2 + uTime * 0.1);
                pos += normalize(pos + noise) * uProgress * 20.0;
            } else { // CONSTELLATION
                // Start from SHOCKWAVE state and move to aTarget
                vec3 noise = curlNoise(pos * 0.2 + uTime * 0.05) * 0.5;
                vec3 explodedPos = normalize(position) * 20.0;
                pos = mix(explodedPos + noise * 5.0, aTarget, pow(uProgress, 1.5));
            }
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * (300.0 / -mvPosition.z) * (1.0 + sin(uTime * 2.0 + aOffset) * 0.2);
            gl_Position = projectionMatrix * mvPosition;
            
            vAlpha = 1.0;
            if (uPhase > 1.5) {
                // Glow more as they form text
                vAlpha = mix(0.6, 1.0, uProgress);
            }
        }
    `,
    fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying float vAlpha;

        void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            
            float strength = 1.0 - (dist * 2.0);
            strength = pow(strength, 3.0);
            
            vec3 color = mix(uColor1, uColor2, dist);
            gl_FragColor = vec4(color, strength * vAlpha);
        }
    `
}

export const ShockwaveShader = {
    uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uProgress;

        void main() {
            vec2 center = vec2(0.5);
            float d = distance(vUv, center);
            
            // Shockwave ring
            float ringWidth = 0.02;
            float ringProgress = uProgress * 0.5; // expand from center
            float ring = smoothstep(ringProgress - ringWidth, ringProgress, d) - 
                         smoothstep(ringProgress, ringProgress + ringWidth, d);
            
            if (ring <= 0.0) discard;
            
            gl_FragColor = vec4(1.0, 1.0, 1.0, ring * (1.0 - uProgress) * 0.5);
        }
    `
}
