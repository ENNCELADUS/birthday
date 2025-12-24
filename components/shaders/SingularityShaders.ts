import * as THREE from 'three'

export const ParticleShader = {
    uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPhase: { value: 0 }, // 0: IMPLOSION, 1: SHOCKWAVE, 2: MESSAGE
        uColor1: { value: new THREE.Color('#00ffff') }, // Cyan
        uColor2: { value: new THREE.Color('#ff00ff') }, // Magenta
        uGold1: { value: new THREE.Color('#FFD700') }, // Gold
        uGold2: { value: new THREE.Color('#00FFFF') }, // Cyan
        uTransition: { value: 0 }, // 0 to 1 for gold transition
        uResolution: { value: new THREE.Vector2() },
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vIsBinary;
        
        uniform float uTime;
        uniform float uProgress;
        uniform float uPhase;
        uniform float uTransition;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uGold1;
        uniform vec3 uGold2;
        
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
            } else if (uPhase < 1.5) { // SHOCKWAVE / GOLD DUST
                vec3 noise = curlNoise(pos * 0.1 + uTime * 0.05);
                pos += normalize(pos + noise) * uProgress * 40.0;
            } else { // MESSAGE / CONSTELLATION - MAGNETIC SNAP
                float explosionProg = smoothstep(0.0, 0.3, uProgress);
                float brakeProg = smoothstep(0.3, 0.5, uProgress);
                float snapProg = smoothstep(0.5, 1.0, uProgress);
                
                float snapEase = pow(snapProg, 2.5); 
                
                vec3 explodedPos = normalize(position) * 45.0; // Pushed further out
                vec3 brakedPos = explodedPos * (1.0 - brakeProg * 0.4); 
                
                vec3 jitter = vec3(
                    sin(uTime * 15.0 + aOffset) * 0.08,
                    cos(uTime * 17.0 + aOffset) * 0.08,
                    sin(uTime * 19.0 + aOffset) * 0.08
                ) * snapProg;

                pos = mix(brakedPos, aTarget + jitter, snapEase);
            }
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            float scale = (400.0 / -mvPosition.z);
            
            // INCREASED POINT SIZE for the message
            float pSize = uPhase > 1.5 ? 5.0 : aSize;
            gl_PointSize = pSize * scale * (1.1 + sin(uTime * 4.0 + aOffset) * 0.4);
            gl_Position = projectionMatrix * mvPosition;
            
            vAlpha = 1.0;
            if (uPhase > 0.5) {
                vAlpha = mix(0.7, 1.0, uTransition);
                if (uPhase > 1.5) {
                    vAlpha = mix(0.3, 1.0, uProgress);
                }
            }

            vec3 baseColor = mix(uColor1, uColor2, aOffset);
            vec3 goldColor = mix(uGold1, uGold2, aOffset);
            
            // High-energy highlights
            if (uPhase > 1.5) {
                float pulse = 0.5 + 0.5 * sin(uTime * 5.0 + aOffset);
                goldColor = mix(goldColor, vec3(1.0), pulse * 0.3);
            }

            vColor = mix(baseColor, goldColor, uTransition);
            vIsBinary = fract(aOffset * 100.0) > 0.8 ? 1.0 : 0.0;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        varying float vIsBinary;
        uniform float uTime;

        void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            
            // Neon tube glow profile
            float strength = 1.0 - (dist * 2.0);
            float core = pow(strength, 2.0);
            float glow = pow(strength, 6.0);
            
            float finalStrength = mix(glow, core, 0.6);
            
            float binaryFlicker = vIsBinary > 0.5 ? step(0.4, sin(uTime * 15.0 + vIsBinary)) : 1.0;
            
            gl_FragColor = vec4(vColor, finalStrength * vAlpha * (0.8 + 0.2 * binaryFlicker));
        }
    `
}

export const ShockwaveShader = {
    uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uColor: { value: new THREE.Color('#ffffff') },
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
        uniform vec3 uColor;

        void main() {
            vec2 center = vec2(0.5);
            float d = distance(vUv, center);
            
            // Multiple rings for "Sonic Boom" effect
            float ring1 = smoothstep(uProgress - 0.05, uProgress, d) - smoothstep(uProgress, uProgress + 0.05, d);
            float ring2 = smoothstep(uProgress * 0.8 - 0.03, uProgress * 0.8, d) - smoothstep(uProgress * 0.8, uProgress * 0.8 + 0.03, d);
            float ring3 = smoothstep(uProgress * 0.6 - 0.02, uProgress * 0.6, d) - smoothstep(uProgress * 0.6, uProgress * 0.6 + 0.02, d);
            
            float combined = ring1 + ring2 * 0.6 + ring3 * 0.3;
            if (combined <= 0.0) discard;
            
            float fade = 1.0 - pow(uProgress, 2.0);
            gl_FragColor = vec4(uColor, combined * fade * 0.8);
        }
    `
}

export const BeamShader = {
    uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uColor: { value: new THREE.Color('#ffffff') },
    },
    vertexShader: `
        varying vec2 vUv;
        varying float vHeight;
        void main() {
            vUv = uv;
            vHeight = position.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        varying float vHeight;
        uniform float uTime;
        uniform float uIntensity;
        uniform vec3 uColor;

        void main() {
            // Horizontal glow
            float glow = 1.0 - abs(vUv.x - 0.5) * 2.0;
            glow = pow(glow, 5.0 + (1.0 - uIntensity) * 10.0);
            
            // Vertical flow texture
            float flow = sin(vHeight * 10.0 - uTime * 20.0) * 0.5 + 0.5;
            float flicker = uIntensity < 0.9 ? (sin(uTime * 50.0) * 0.3 + 0.7) : 1.0;
            
            float finalAlpha = glow * uIntensity * flicker * (0.5 + flow * 0.5);
            gl_FragColor = vec4(uColor, finalAlpha);
        }
    `
}

export const NeonTubeShader = {
    uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uColor: { value: new THREE.Color('#ffcc33') },
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
        uniform float uOpacity;
        uniform vec3 uColor;

        void main() {
            // Simulated gas flickering inside glass tube
            float flicker = sin(uTime * 30.0 + vUv.x * 10.0) * 0.1 + 0.9;
            float pulse = sin(uTime * 2.0) * 0.05 + 0.95;
            
            gl_FragColor = vec4(uColor, uOpacity * flicker * pulse);
        }
    `
}

export const HologramMaterialShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#00ffff') },
        uOpacity: { value: 0.5 },
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;

        void main() {
            float scanline = sin(vPosition.y * 50.0 - uTime * 10.0) * 0.1 + 0.9;
            float grid = sin(vUv.x * 100.0) * sin(vUv.y * 100.0);
            grid = step(0.9, grid) * 0.5 + 0.5;
            
            gl_FragColor = vec4(uColor, uOpacity * scanline * grid);
        }
    `
}
