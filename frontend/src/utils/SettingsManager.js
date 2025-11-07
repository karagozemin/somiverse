/**
 * Settings Manager
 * Manages game settings (sound, graphics, etc.)
 */
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.createSettingsButton();
        this.createSettingsPanel();
    }

    loadSettings() {
        const defaults = {
            soundEnabled: true,
            musicEnabled: true,
            soundVolume: 0.7,
            musicVolume: 0.5,
            graphicsQuality: 'high',
            showFPS: false,
            showHints: true
        };

        try {
            const saved = localStorage.getItem('somnia_settings');
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (error) {
            return defaults;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('somnia_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.updateUI();
        this.applySettings();
    }

    createSettingsButton() {
        // Settings button disabled - user requested removal
        // const button = document.createElement('button');
        // ... (removed)
    }

    createSettingsPanel() {
        // Settings panel disabled - user requested removal
        return;
        const panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 320px;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            padding: 20px;
            z-index: 998;
            display: none;
            color: white;
        `;

        panel.innerHTML = `
            <h3 style="margin: 0 0 20px 0; font-size: 20px; background: linear-gradient(135deg, #FF0080, #00D4FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">⚙️ Settings</h3>
            
            <div class="setting-group">
                <label class="setting-label">
                    <input type="checkbox" id="sound-toggle" ${this.settings.soundEnabled ? 'checked' : ''}>
                    <span>Sound Effects</span>
                </label>
                <input type="range" id="sound-volume" min="0" max="100" value="${this.settings.soundVolume * 100}" 
                    ${!this.settings.soundEnabled ? 'disabled' : ''} class="volume-slider">
            </div>

            <div class="setting-group">
                <label class="setting-label">
                    <input type="checkbox" id="music-toggle" ${this.settings.musicEnabled ? 'checked' : ''}>
                    <span>Background Music</span>
                </label>
                <input type="range" id="music-volume" min="0" max="100" value="${this.settings.musicVolume * 100}"
                    ${!this.settings.musicEnabled ? 'disabled' : ''} class="volume-slider">
            </div>

            <div class="setting-group">
                <label class="setting-label">Graphics Quality</label>
                <select id="graphics-quality" class="setting-select">
                    <option value="low" ${this.settings.graphicsQuality === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${this.settings.graphicsQuality === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${this.settings.graphicsQuality === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>

            <div class="setting-group">
                <label class="setting-label">
                    <input type="checkbox" id="show-fps" ${this.settings.showFPS ? 'checked' : ''}>
                    <span>Show FPS Counter</span>
                </label>
            </div>

            <div class="setting-group">
                <label class="setting-label">
                    <input type="checkbox" id="show-hints" ${this.settings.showHints ? 'checked' : ''}>
                    <span>Show Hints</span>
                </label>
            </div>

            <button id="reset-settings" style="
                width: 100%;
                padding: 10px;
                margin-top: 15px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.2s;
            ">Reset to Defaults</button>

            <style>
                .setting-group {
                    margin-bottom: 15px;
                }
                .setting-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    user-select: none;
                }
                .setting-label input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }
                .volume-slider {
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: rgba(255, 255, 255, 0.1);
                    outline: none;
                    -webkit-appearance: none;
                }
                .volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FF0080, #00D4FF);
                    cursor: pointer;
                }
                .setting-select {
                    width: 100%;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    outline: none;
                }
                .setting-select option {
                    background: #1a1a1a;
                    color: white;
                    padding: 10px;
                }
                #reset-settings:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: #FF0080;
                }
            </style>
        `;

        document.body.appendChild(panel);
        this.attachSettingsListeners();
    }

    attachSettingsListeners() {
        // Sound toggle
        document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
            this.set('soundEnabled', e.target.checked);
            document.getElementById('sound-volume').disabled = !e.target.checked;
        });

        // Music toggle
        document.getElementById('music-toggle')?.addEventListener('change', (e) => {
            this.set('musicEnabled', e.target.checked);
            document.getElementById('music-volume').disabled = !e.target.checked;
        });

        // Volume sliders
        document.getElementById('sound-volume')?.addEventListener('input', (e) => {
            this.set('soundVolume', e.target.value / 100);
        });

        document.getElementById('music-volume')?.addEventListener('input', (e) => {
            this.set('musicVolume', e.target.value / 100);
        });

        // Graphics quality
        document.getElementById('graphics-quality')?.addEventListener('change', (e) => {
            this.set('graphicsQuality', e.target.value);
        });

        // FPS toggle
        document.getElementById('show-fps')?.addEventListener('change', (e) => {
            this.set('showFPS', e.target.checked);
        });

        // Hints toggle
        document.getElementById('show-hints')?.addEventListener('change', (e) => {
            this.set('showHints', e.target.checked);
        });

        // Reset button
        document.getElementById('reset-settings')?.addEventListener('click', () => {
            if (confirm('Reset all settings to defaults?')) {
                this.resetSettings();
            }
        });
    }

    toggleSettingsPanel() {
        const panel = document.getElementById('settings-panel');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }

    updateUI() {
        // Update UI elements if panel is open
        const soundToggle = document.getElementById('sound-toggle');
        const musicToggle = document.getElementById('music-toggle');
        const soundVolume = document.getElementById('sound-volume');
        const musicVolume = document.getElementById('music-volume');
        const graphicsQuality = document.getElementById('graphics-quality');
        const showFPS = document.getElementById('show-fps');
        const showHints = document.getElementById('show-hints');

        if (soundToggle) soundToggle.checked = this.settings.soundEnabled;
        if (musicToggle) musicToggle.checked = this.settings.musicEnabled;
        if (soundVolume) soundVolume.value = this.settings.soundVolume * 100;
        if (musicVolume) musicVolume.value = this.settings.musicVolume * 100;
        if (graphicsQuality) graphicsQuality.value = this.settings.graphicsQuality;
        if (showFPS) showFPS.checked = this.settings.showFPS;
        if (showHints) showHints.checked = this.settings.showHints;
    }

    applySettings() {
        // Apply settings to game
        if (window.somniaGame) {
            // Update FPS display
            const debugPlugin = window.somniaGame.plugins.get('rexfps');
            if (debugPlugin) {
                debugPlugin.visible = this.settings.showFPS;
            }

            // Apply graphics quality
            // (would need Phaser scene reference to actually change render settings)
        }

        // Dispatch event for other systems
        window.dispatchEvent(new CustomEvent('settingsChanged', { 
            detail: this.settings 
        }));
    }

    resetSettings() {
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            soundVolume: 0.7,
            musicVolume: 0.5,
            graphicsQuality: 'high',
            showFPS: false,
            showHints: true
        };
        this.saveSettings();
        this.updateUI();
        this.applySettings();
    }
}

// Singleton instance
const settingsManager = new SettingsManager();

export default settingsManager;

