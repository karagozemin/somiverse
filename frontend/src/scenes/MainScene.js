import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Building from '../entities/Building.js';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        // Isometric grid settings (updated to match new tile size)
        this.tileWidth = 130;
        this.tileHeight = 66;
        this.gridWidth = 20;
        this.gridHeight = 20;

        // Camera setup - Centered map
        this.cameras.main.setBounds(-500, -500, 3000, 3000);
        this.cameras.main.setZoom(0.85); // Optimal zoom level

        // Create the isometric world
        this.createIsometricWorld();

        // Create buildings
        this.buildings = [];
        this.createBuildings();

        // Create player at center
        this.player = new Player(this, 10, 10);
        
        // Camera follows player
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };

        // Store reference for other scenes
        this.registry.set('mainScene', this);
    }

    createIsometricWorld() {
        this.tiles = [];
        
        // Calculate offset to center the map
        const offsetX = this.cameras.main.width / 2;
        const offsetY = this.cameras.main.height / 2 - 200;
        
        // Create a professional map with grass, water, paths, trees, and stones
        for (let y = 0; y < this.gridHeight; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                let tileType = 'tile-grass';
                
                // Water around edges
                if (x === 0 || x === this.gridWidth - 1 || y === 0 || y === this.gridHeight - 1) {
                    tileType = 'tile-water';
                }
                // Paths in cross pattern (stone path)
                else if (x === 10 || y === 10) {
                    tileType = 'tile-path';
                }
                // Random decorative elements on grass
                else {
                    const rand = Math.random();
                    if (rand < 0.08) { // 8% chance for tree
                        tileType = 'tile-tree';
                    } else if (rand < 0.12) { // 4% chance for stone
                        tileType = 'tile-stone';
                    }
                }
                
                const isoPos = this.cartesianToIsometric(x, y);
                const tile = this.add.image(isoPos.x + offsetX, isoPos.y + offsetY, tileType);
                tile.setOrigin(0.5, 0.5);
                tile.setDepth(y * 100 + x);
                tile.setTint(0xffffff);
                tile.setAlpha(1);
                
                this.tiles[y][x] = {
                    sprite: tile,
                    type: tileType,
                    gridX: x,
                    gridY: y
                };
            }
        }
    }

    createBuildings() {
        // Simple building markers - Top left quadrant
        this.buildings.push(new Building(this, 6, 6, 'building-swap', 'Swap City', 'swap'));
        
        // NFT Gallery - Top right quadrant
        this.buildings.push(new Building(this, 14, 6, 'building-nft', 'NFT Gallery', 'nft'));
        
        // Token Fountain - Bottom left quadrant
        this.buildings.push(new Building(this, 6, 14, 'building-faucet', 'Token Fountain', 'faucet'));
        
        // Staking Tower - Bottom right quadrant
        this.buildings.push(new Building(this, 14, 14, 'building-staking', 'Staking Tower', 'staking'));
    }

    update() {
        if (!this.player) return;

        // Player movement
        let moveX = 0;
        let moveY = 0;

        if (this.keys.W.isDown || this.cursors.up.isDown) {
            moveY = -1;
        } else if (this.keys.S.isDown || this.cursors.down.isDown) {
            moveY = 1;
        }

        if (this.keys.A.isDown || this.cursors.left.isDown) {
            moveX = -1;
        } else if (this.keys.D.isDown || this.cursors.right.isDown) {
            moveX = 1;
        }

        if (moveX !== 0 || moveY !== 0) {
            this.player.move(moveX, moveY);
        }

        // Check proximity to buildings (auto-open on close)
        this.checkBuildingProximity();
    }

    checkBuildingInteraction() {
        const playerGridPos = this.player.getGridPosition();
        
        this.buildings.forEach(building => {
            const distance = Phaser.Math.Distance.Between(
                playerGridPos.x, playerGridPos.y,
                building.gridX, building.gridY
            );
            
            if (distance < 2) {
                building.interact();
            }
        });
    }

    checkBuildingProximity() {
        const playerGridPos = this.player.getGridPosition();
        
        this.buildings.forEach(building => {
            const distance = Phaser.Math.Distance.Between(
                playerGridPos.x, playerGridPos.y,
                building.gridX, building.gridY
            );
            
            const isNear = distance < 2;
            building.setProximity(isNear);
            
            // Auto-open popup when close (no need to press E)
            if (isNear && !building.popupOpened) {
                building.popupOpened = true;
                building.interact();
            } else if (!isNear) {
                building.popupOpened = false;
            }
        });
    }

    // Coordinate conversion utilities
    cartesianToIsometric(cartX, cartY) {
        const isoX = (cartX - cartY) * (this.tileWidth / 2);
        const isoY = (cartX + cartY) * (this.tileHeight / 2);
        
        return {
            x: isoX,
            y: isoY
        };
    }

    isometricToCartesian(isoX, isoY) {
        const cartX = (isoX / (this.tileWidth / 2) + isoY / (this.tileHeight / 2)) / 2;
        const cartY = (isoY / (this.tileHeight / 2) - isoX / (this.tileWidth / 2)) / 2;
        
        return { x: Math.round(cartX), y: Math.round(cartY) };
    }
}

