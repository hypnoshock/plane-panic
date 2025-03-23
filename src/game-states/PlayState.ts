import * as THREE from 'three';
import { GameState } from './GameState';
import { Spaceship } from '../game-models/Spaceship';
import { Player } from '../game-objects/Player';
import { KeyboardHandler } from '../system/KeyboardHandler';
import { BulletSystem } from '../system/BulletSystem';
import { EnemySpawner } from '../system/EnemySpawner';
import { GameStateManager } from './GameStateManager';
import { MenuState } from './MenuState';

export class PlayState implements GameState {
    private bulletSystem: BulletSystem;
    private player: Player;
    private enemySpawner: EnemySpawner;
    private keyboardHandler!: KeyboardHandler;
    private gameOverScreen: HTMLDivElement;
    private energyDisplay: HTMLDivElement;
    private isGameOver: boolean = false;
    private gameStateManager!: GameStateManager;
    private backgroundTexture: THREE.CanvasTexture | null = null;

    constructor(
        private scene: THREE.Scene,
        private camera: THREE.PerspectiveCamera,
        private renderer: THREE.WebGLRenderer
    ) {
        // Create bullet system
        this.bulletSystem = new BulletSystem(scene);

        // Create player with spaceship
        const spaceship = new Spaceship();
        this.player = new Player(spaceship);
        this.player.setBulletSystem(this.bulletSystem);
        this.bulletSystem.setPlayer(this.player);
        scene.add(this.player.getGroup());

        // Create enemy spawner
        this.enemySpawner = new EnemySpawner(scene, this.bulletSystem);
        this.bulletSystem.setEnemySpawner(this.enemySpawner);

        // Create game over screen
        this.gameOverScreen = document.createElement('div');
        this.gameOverScreen.className = 'game-over';
        this.gameOverScreen.innerHTML = 'GAME OVER<br/>Press RETURN to return to menu';
        document.body.appendChild(this.gameOverScreen);

        // Create energy display
        this.energyDisplay = document.createElement('div');
        this.energyDisplay.style.position = 'absolute';
        this.energyDisplay.style.top = '20px';
        this.energyDisplay.style.left = '20px';
        this.energyDisplay.style.color = 'white';
        this.energyDisplay.style.fontSize = '24px';
        this.energyDisplay.style.fontFamily = 'Arial, sans-serif';
        this.energyDisplay.textContent = 'Energy: 3';
        document.body.appendChild(this.energyDisplay);

        // Add lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        // Position camera
        camera.position.z = 5;

        // Create keyboard handler with event handler
        this.keyboardHandler = new KeyboardHandler((event: string, isPress: boolean) => {
            if (this.isGameOver) {
                if (event === 'button2' && isPress) {
                    const menuState = new MenuState(this.scene, this.camera, this.renderer);
                    menuState.setGameStateManager(this.gameStateManager);
                    this.gameStateManager.setState(menuState);
                }
                return;
            }

            switch (event) {
                case 'up':
                    this.player.moveUp();
                    break;
                case 'down':
                    this.player.moveDown();
                    break;
                case 'left':
                    this.player.moveLeft();
                    break;
                case 'right':
                    this.player.moveRight();
                    break;
                case 'button1':
                    if (isPress) {
                        this.player.shoot();
                    }
                    break;
            }
        });
    }

    private setupBackground(): void {
        // Create gradient texture for background
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 2;
        canvas.height = 512;
        if (context) {
            const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#ff69b4');  // pink
            gradient.addColorStop(1, '#00008b');  // dark blue
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        this.backgroundTexture = new THREE.CanvasTexture(canvas);
        this.backgroundTexture.needsUpdate = true;
        this.scene.background = this.backgroundTexture;
    }

    public setGameStateManager(manager: GameStateManager): void {
        this.gameStateManager = manager;
    }

    public enter(): void {
        this.setupBackground();
        this.resetGame();
    }

    public exit(): void {
        // Clean up UI elements
        this.gameOverScreen.remove();
        this.energyDisplay.remove();

        // Clean up game objects
        this.scene.remove(this.player.getGroup());
        this.enemySpawner.clearEnemies();
        this.bulletSystem.clearBullets();
        this.bulletSystem.cleanup();

        // Clean up background texture
        if (this.backgroundTexture) {
            this.backgroundTexture.dispose();
            this.backgroundTexture = null;
        }
        this.scene.background = null;
    }

    public update(): void {
        this.player.update();
        this.keyboardHandler.update();
        this.bulletSystem.update();
        this.enemySpawner.update();

        // Update energy display
        this.energyDisplay.textContent = `Energy: ${this.player.getLives()}`;

        // Check for game over
        if (this.player.isDead() && !this.isGameOver) {
            this.isGameOver = true;
            this.gameOverScreen.classList.add('visible');
            this.player.setGameOver();
        }
    }

    public render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    private resetGame(): void {
        console.log('resetGame');
        console.trace();
        // Reset player
        this.player.reset();
        this.player.getGroup().visible = true;
        
        // Clear all enemies
        this.enemySpawner.clearEnemies();
        
        // Clear all bullets
        this.bulletSystem.clearBullets();
        
        // Reset score
        this.bulletSystem.resetScore();
        
        // Hide game over screen
        this.gameOverScreen.classList.remove('visible');
        
        // Reset game state
        this.isGameOver = false;
    }
} 