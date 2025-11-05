class PointsManager {
    constructor() {
        this.storageKey = 'somnia_land_points';
        this.pointsData = this.loadPoints();

        // Points rewards for different actions
        this.rewards = {
            'faucet': 50,
            'swap': 150,
            'staking': 250,
            'nft': 400
        };
    }

    loadPoints() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading points:', error);
            return {};
        }
    }

    savePoints() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.pointsData));
        } catch (error) {
            console.error('Error saving points:', error);
        }
    }

    getPoints(address) {
        if (!address) return 0;
        const normalizedAddress = address.toLowerCase();
        return this.pointsData[normalizedAddress] || 0;
    }

    addPoints(address, actionType) {
        if (!address) return 0;
        
        const normalizedAddress = address.toLowerCase();
        const points = this.rewards[actionType] || 0;
        
        if (points > 0) {
            const currentPoints = this.getPoints(normalizedAddress);
            const newPoints = currentPoints + points;
            this.pointsData[normalizedAddress] = newPoints;
            this.savePoints();

            // Update UI
            this.updatePointsDisplay(newPoints);

            // Show floating points animation
            this.showFloatingPoints(points);

            console.log(`Added ${points} points for ${actionType}. Total: ${newPoints}`);
            return points;
        }

        return 0;
    }

    updatePointsDisplay(points) {
        const pointsElement = document.getElementById('points-value');
        if (pointsElement) {
            // Animate the update
            pointsElement.style.transform = 'scale(1.2)';
            pointsElement.textContent = points;
            
            setTimeout(() => {
                pointsElement.style.transform = 'scale(1)';
            }, 300);
        }

        // Update Phaser registry if game exists
        if (window.somniaGame) {
            window.somniaGame.registry.set('points', points);
        }
    }

    showFloatingPoints(points) {
        const container = document.getElementById('game-container');
        if (!container) return;

        const floatingDiv = document.createElement('div');
        floatingDiv.className = 'floating-points';
        floatingDiv.textContent = `+${points}`;
        floatingDiv.style.left = '50%';
        floatingDiv.style.top = '50%';

        container.appendChild(floatingDiv);

        // Remove after animation
        setTimeout(() => {
            floatingDiv.remove();
        }, 1500);
    }

    getReward(actionType) {
        return this.rewards[actionType] || 0;
    }

    // Get leaderboard (top 10 players)
    getLeaderboard() {
        const entries = Object.entries(this.pointsData)
            .map(([address, points]) => ({ address, points }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 10);
        
        return entries;
    }

    // Reset points for an address (for testing)
    resetPoints(address) {
        if (!address) return;
        const normalizedAddress = address.toLowerCase();
        delete this.pointsData[normalizedAddress];
        this.savePoints();
        this.updatePointsDisplay(0);
    }
}

// Singleton instance
const pointsManager = new PointsManager();

export default pointsManager;

