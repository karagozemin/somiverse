import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, SMAAEffect, SMAAPreset } from 'postprocessing';

// Somnia color palette
const SOMNIA_COLORS = {
    pink: 0xFF0080,
    cyan: 0x00D4FF,
    purple: 0x8B5CF6,
    blue: 0x4F46E5,
    background: 0x0f142e
};

// Default effect options
const DEFAULT_EFFECT_OPTIONS = {
    // Colors
    colors: [
        new THREE.Color(SOMNIA_COLORS.pink),
        new THREE.Color(SOMNIA_COLORS.purple),
        new THREE.Color(SOMNIA_COLORS.cyan)
    ],
    // Line properties
    lineCount: 80, // Daha az çizgi - göz yormasın
    lineWidth: 0.5,
    lineLength: 1000,
    // Distortion
    distortionSpeed: 2.0,
    distortionAmount: 0.3,
    // Movement
    speed: 3.0, // Daha makul hız
    // Opacity
    opacity: 0.6, // Daha hafif opacity
    // Animation
    animateColors: true,
    colorSpeed: 0.5
};

function lerp(current, target, speed = 0.1) {
    return current + (target - current) * speed;
}

class HyperspeedIntro {
    constructor(container, effectOptions = {}) {
        this.container = container;
        this.disposed = false;
        this.options = { ...DEFAULT_EFFECT_OPTIONS, ...effectOptions };
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        // Setup composer
        this.composer = new EffectComposer(this.renderer);
        
        // Setup camera - çizgilerin son kısmını görmek için (içeriden bakıyoruz)
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.offsetWidth / container.offsetHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 2, 5); // Çizgilerin içinden bakıyoruz
        this.camera.lookAt(0, 10, 0); // Yukarı doğru genişleyen çizgilerin sonuna bak
        
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = null;
        
        // Clock
        this.clock = new THREE.Clock();
        
        // Speed control
        this.speedUp = 0;
        this.speedUpTarget = 0;
        this.timeOffset = 0;
        this.maxSpeed = false;
        
        // Create hyperspeed lines
        this.createHyperspeedLines();
        
        // Setup passes
        this.initPasses();
        
        // Event listeners
        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.onWindowResize);
        
        // Start animation
        this.tick();
    }
    
    createHyperspeedLines() {
        this.linesGroup = new THREE.Group();
        
        // Create multiple line groups for depth
        const lineGroups = [];
        const segmentsPerLine = 50;
        
        for (let i = 0; i < this.options.lineCount; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array((segmentsPerLine + 1) * 3);
            const colors = new Float32Array((segmentsPerLine + 1) * 3);
            
            // Start from bottom center, spread outward - sadece son kısım görünecek
            const angle = (Math.PI * 2 * i) / this.options.lineCount;
            const spreadRadius = Math.random() * 10 + 5; // Daha geniş dağılma (son kısım efekti)
            const startX = Math.cos(angle) * 0.3; // Merkezden başla
            const startY = -2; // Biraz aşağıdan başla
            const startZ = Math.sin(angle) * 0.3;
            
            // Create line segments - sadece son kısım (yukarı doğru genişleyen)
            for (let j = 0; j <= segmentsPerLine; j++) {
                const t = j / segmentsPerLine;
                const y = startY + t * 18; // Yukarı doğru (sadece son kısım)
                
                // Add distortion/wave effect
                const distortion = this.getDistortion(t, i);
                
                // Alttan yukarı doğru genişle (X ve Z eksenlerinde dağıl)
                const spreadFactor = t * spreadRadius;
                positions[j * 3] = startX + Math.cos(angle) * spreadFactor + distortion.x;
                positions[j * 3 + 1] = y + distortion.y;
                positions[j * 3 + 2] = startZ + Math.sin(angle) * spreadFactor;
                
                // Color gradient along the line
                const colorIndex = Math.floor(t * (this.options.colors.length - 1));
                const colorT = (t * (this.options.colors.length - 1)) % 1;
                const color1 = this.options.colors[colorIndex];
                const color2 = this.options.colors[Math.min(colorIndex + 1, this.options.colors.length - 1)];
                
                colors[j * 3] = color1.r + (color2.r - color1.r) * colorT;
                colors[j * 3 + 1] = color1.g + (color2.g - color1.g) * colorT;
                colors[j * 3 + 2] = color1.b + (color2.b - color1.b) * colorT;
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const material = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: this.options.opacity,
                linewidth: this.options.lineWidth
            });
            
            const line = new THREE.Line(geometry, material);
            line.userData = {
                startX,
                startY,
                startZ,
                angle,
                spreadRadius,
                speed: this.options.speed * (0.8 + Math.random() * 0.4),
                colorOffset: Math.random() * Math.PI * 2
            };
            
            this.linesGroup.add(line);
        }
        
        this.scene.add(this.linesGroup);
    }
    
    getDistortion(t, lineIndex) {
        // Create wave/distortion effect
        const time = this.clock.elapsedTime + this.timeOffset;
        const wave = Math.sin(t * Math.PI * 4 + time * this.options.distortionSpeed + lineIndex * 0.1);
        const wave2 = Math.cos(t * Math.PI * 6 + time * this.options.distortionSpeed * 0.7 + lineIndex * 0.15);
        
        return {
            x: wave * this.options.distortionAmount * t,
            y: wave2 * this.options.distortionAmount * t * 0.5
        };
    }
    
    updateLines(delta = 0.016) {
        const time = this.clock.elapsedTime + this.timeOffset;
        const speedMultiplier = this.maxSpeed ? 2 : 1;
        
        this.linesGroup.children.forEach((line, index) => {
            const positions = line.geometry.attributes.position.array;
            const colors = line.geometry.attributes.color.array;
            const userData = line.userData;
            const segments = positions.length / 3;
            
            // Move line upward - alttan yukarı
            const baseSpeed = this.maxSpeed ? userData.speed * speedMultiplier : userData.speed * 0.5;
            const moveSpeed = baseSpeed * delta * 60; // Delta time kullanarak daha kontrollü hareket
            
            for (let i = 0; i < segments; i++) {
                const t = i / (segments - 1);
                const y = userData.startY + t * 18 - moveSpeed; // Yukarı doğru hareket
                
                // Wrap around when line goes too far up
                if (y > 20) {
                    const wrapY = y - 22; // Wrap
                    positions[i * 3 + 1] = wrapY;
                } else {
                    positions[i * 3 + 1] = y;
                }
                
                // Update distortion
                const distortion = this.getDistortion(t, index);
                
                // Yukarı doğru genişle (son kısım efekti - bize doğru geliyormuş gibi)
                const currentT = Math.max(0, Math.min(1, (y - userData.startY) / 18));
                const spreadFactor = currentT * userData.spreadRadius;
                positions[i * 3] = userData.startX + Math.cos(userData.angle) * spreadFactor + distortion.x;
                positions[i * 3 + 2] = userData.startZ + Math.sin(userData.angle) * spreadFactor;
                
                // Animate colors if enabled
                if (this.options.animateColors) {
                    const colorTime = time * this.options.colorSpeed + userData.colorOffset;
                    const colorIndex = Math.floor((t + colorTime * 0.1) % 1 * (this.options.colors.length - 1));
                    const colorT = ((t + colorTime * 0.1) % 1 * (this.options.colors.length - 1)) % 1;
                    const color1 = this.options.colors[colorIndex];
                    const color2 = this.options.colors[Math.min(colorIndex + 1, this.options.colors.length - 1)];
                    
                    colors[i * 3] = color1.r + (color2.r - color1.r) * colorT;
                    colors[i * 3 + 1] = color1.g + (color2.g - color1.g) * colorT;
                    colors[i * 3 + 2] = color1.b + (color2.b - color1.b) * colorT;
                }
            }
            
            line.geometry.attributes.position.needsUpdate = true;
            line.geometry.attributes.color.needsUpdate = true;
        });
    }
    
    initPasses() {
        const renderPass = new RenderPass(this.scene, this.camera);
        const bloomPass = new EffectPass(
            this.camera,
            new BloomEffect({
                luminanceThreshold: 0.1,
                luminanceSmoothing: 0.9,
                intensity: 2.0,
                resolutionScale: 1
            })
        );
        const smaaPass = new EffectPass(
            this.camera,
            new SMAAEffect({ preset: SMAAPreset.MEDIUM })
        );
        
        renderPass.renderToScreen = false;
        bloomPass.renderToScreen = false;
        smaaPass.renderToScreen = true;
        
        this.composer.addPass(renderPass);
        this.composer.addPass(bloomPass);
        this.composer.addPass(smaaPass);
    }
    
    update(delta) {
        // Speed control
        const lerpSpeed = this.maxSpeed ? 0.3 : 0.1;
        this.speedUp = lerp(this.speedUp, this.speedUpTarget, lerpSpeed);
        this.timeOffset += this.speedUp * delta;
        
        // Update lines - delta'yi geçir
        this.updateLines(delta);
        
        // Camera FOV effect when max speed
        if (this.maxSpeed) {
            this.camera.fov = lerp(this.camera.fov, 120, 0.1);
        } else {
            this.camera.fov = lerp(this.camera.fov, 75, 0.1);
        }
        this.camera.updateProjectionMatrix();
    }
    
    render() {
        this.composer.render();
    }
    
    tick() {
        if (this.disposed) return;
        
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        
        if (this.renderer.domElement.width !== width || this.renderer.domElement.height !== height) {
            this.renderer.setSize(width, height, false);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.composer.setSize(width, height);
        }
        
        const delta = this.clock.getDelta();
        this.update(delta);
        this.render();
        
        requestAnimationFrame(() => this.tick());
    }
    
    onWindowResize() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.composer.setSize(width, height);
    }
    
    speedUpAnimation() {
        this.speedUpTarget = 2;
    }
    
    setMaxSpeed() {
        this.maxSpeed = true;
        this.speedUpTarget = 5;
        
        // Increase intensity
        if (this.linesGroup) {
            this.linesGroup.children.forEach(line => {
                line.material.opacity = Math.min(this.options.opacity * 1.5, 1.0);
            });
        }
    }
    
    slowDownAnimation() {
        this.maxSpeed = false;
        this.speedUpTarget = 0;
        
        // Reset intensity
        if (this.linesGroup) {
            this.linesGroup.children.forEach(line => {
                line.material.opacity = this.options.opacity;
            });
        }
    }
    
    dispose() {
        this.disposed = true;
        window.removeEventListener('resize', this.onWindowResize);
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.composer) {
            this.composer.dispose();
        }
        if (this.scene) {
            this.scene.clear();
        }
        if (this.container && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

export default HyperspeedIntro;
