import HyperspeedIntro from './HyperspeedIntro.js';

class IntroManager {
    constructor() {
        this.introScreen = document.getElementById('intro-screen');
        this.introLights = document.getElementById('intro-lights');
        this.introTitle = document.getElementById('intro-title');
        this.gameContainer = document.getElementById('game-container');
        this.hyperspeed = null;
        this.introDuration = 3000; // 3 saniye çizgiler, sonra başlığa zoom
        this.titleElement = null;
    }
    
    async init() {
        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Add title animation effects
        this.setupTitleAnimation();
        
        // Initialize Hyperspeed - sadece son kısım görünecek
        try {
            this.hyperspeed = new HyperspeedIntro(this.introLights);
            
            // Başlığı yavaşça göster
            if (this.titleElement) {
                this.titleElement.style.opacity = '0';
                this.titleElement.style.transition = 'opacity 1s ease-in';
                setTimeout(() => {
                    if (this.titleElement) {
                        this.titleElement.style.opacity = '1';
                    }
                }, 500);
            }
            
            // Çizgiler hızlanır
            setTimeout(() => {
                if (this.hyperspeed) {
                    this.hyperspeed.speedUpAnimation();
                }
            }, 1000);
            
            // Başlığa zoom efekti ve haritaya geçiş
            setTimeout(() => {
                this.zoomToTitle();
            }, this.introDuration);
        } catch (error) {
            console.error('Error initializing Hyperspeed intro:', error);
            // Fallback: skip intro if error
            this.transitionToGame();
        }
    }
    
    setupTitleAnimation() {
        this.titleElement = document.querySelector('.somiverse-title');
        if (this.titleElement) {
            // Başlangıçta gizli, JavaScript kontrol edecek
            this.titleElement.style.opacity = '0';
            this.titleElement.style.transform = 'scale(1)';
        }
    }
    
    addFlashEffect() {
        // Create flash overlay (daha hafif)
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(255, 0, 128, 0.4) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(0, 212, 255, 0.4) 100%);
            z-index: 10001;
            opacity: 0;
            animation: flashEffect 0.4s ease-out;
            pointer-events: none;
        `;
        document.body.appendChild(flash);
        
        // Remove after animation
        setTimeout(() => {
            flash.remove();
        }, 400);
    }
    
    zoomToTitle() {
        // Çizgileri fade out
        if (this.introLights) {
            this.introLights.style.transition = 'opacity 0.8s ease-out';
            this.introLights.style.opacity = '0';
        }
        
        // Başlık blur ile kaybolsun
        if (this.titleElement) {
            // Önce hafif parlasın
            this.titleElement.style.transition = 'opacity 0.5s ease-out, filter 0.5s ease-out';
            this.titleElement.style.opacity = '1';
            this.titleElement.style.filter = 'drop-shadow(0 0 80px rgba(255, 0, 128, 1))';
            
            // Sonra blur ile kaybolsun
            setTimeout(() => {
                if (this.titleElement) {
                    this.titleElement.style.transition = 'opacity 0.8s ease-out, filter 0.8s ease-out';
                    this.titleElement.style.opacity = '0';
                    this.titleElement.style.filter = 'blur(20px) drop-shadow(0 0 80px rgba(255, 0, 128, 0.5))';
                }
            }, 600);
        }
        
        // Flash efekti (daha hafif)
        setTimeout(() => {
            this.addFlashEffect();
        }, 800);
        
        // Haritaya geçiş
        setTimeout(() => {
            this.transitionToGame();
        }, 1500);
    }
    
    transitionToGame() {
        // Clean up Hyperspeed
        if (this.hyperspeed) {
            this.hyperspeed.dispose();
            this.hyperspeed = null;
        }
        
        // Intro screen'i gizle
        if (this.introScreen) {
            this.introScreen.style.display = 'none';
        }
        
        // Game container'ı göster
        if (this.gameContainer) {
            this.gameContainer.style.display = 'block';
            this.gameContainer.style.animation = 'fadeInScale 0.8s ease-out';
        }
        
        // Initialize game after intro
        this.initGame();
    }
    
    initGame() {
        // Import and initialize game
        import('../main.js').then(() => {
            console.log('Game initialized after intro');
        });
    }
}

// Auto-start intro when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const introManager = new IntroManager();
        introManager.init();
    });
} else {
    const introManager = new IntroManager();
    introManager.init();
}

export default IntroManager;

