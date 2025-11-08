export default class FaucetPopup {
    constructor() {
        // Boş pop-up - içerik yok
    }

    render(title) {
        return `
            <div class="popup-header">
                <h2 class="popup-title">${title}</h2>
                <button class="close-btn" id="close-popup">&times;</button>
            </div>
            <div class="popup-body">
                <!-- Boş pop-up - içerik eklenecek -->
            </div>
        `;
    }

    attachEventListeners() {
        document.getElementById('close-popup')?.addEventListener('click', () => {
            this.close();
        });
    }

    close() {
        import('./PopupManager.js').then(module => {
            module.default.closePopup();
        });
    }
}

