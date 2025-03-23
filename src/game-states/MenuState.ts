import { GameState } from './GameState';
import * as THREE from 'three';
import { GameStateManager } from './GameStateManager';
import { PlayState } from './PlayState';
import { KeyboardHandler } from '../system/KeyboardHandler';
import { AudioSystem } from '../system/AudioSystem';
import { EnemyShip } from '../game-models/EnemyShip';
import { FastEnemyShipModel } from '../game-models/FastEnemyShipModel';
import { ScreenControlHandler } from '../system/ScreenControlHandler';

export class MenuState implements GameState {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private gameStateManager!: GameStateManager;
    private menuContainer!: HTMLDivElement;
    private selectedOption: number = 0;
    private options: string[] = ['Start Game', 'High Scores'];
    private keyboardHandler!: KeyboardHandler;
    private screenControlHandler?: ScreenControlHandler;
    private backgroundTexture: THREE.CanvasTexture | null = null;
    private audioSystem: AudioSystem;
    private menuShips: THREE.Group[] = [];
    private lastUpdateTime: number = 0;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.audioSystem = new AudioSystem();
        this.setupMenu();
        this.setupInputHandlers();
        this.setupMenuShips();
    }

    private setupBackground(): void {
        // Create gradient texture for background
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 2;
        canvas.height = 512;
        if (context) {
            const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#000000');  // black
            gradient.addColorStop(1, '#00008b');  // dark red
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        this.backgroundTexture = new THREE.CanvasTexture(canvas);
        this.backgroundTexture.needsUpdate = true;
        this.scene.background = this.backgroundTexture;
    }

    private setupMenu(): void {
        // Create menu container
        this.menuContainer = document.createElement('div');
        this.menuContainer.style.position = 'absolute';
        this.menuContainer.style.top = '50%';
        this.menuContainer.style.left = '50%';
        this.menuContainer.style.transform = 'translate(-50%, -50%)';
        this.menuContainer.style.textAlign = 'center';
        this.menuContainer.style.color = 'white';
        this.menuContainer.style.fontFamily = 'Arial, sans-serif';
        this.menuContainer.style.fontSize = '32px';
        this.menuContainer.style.zIndex = '1000';
        document.body.appendChild(this.menuContainer);
    }

    private setupInputHandlers(): void {
        const inputHandler = (event: string, isPress: boolean) => {
            // Only handle press events for the menu
            if (!isPress) return;

            switch (event) {
                case 'up':
                    this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
                    break;
                case 'down':
                    this.selectedOption = (this.selectedOption + 1) % this.options.length;
                    break;
                case 'button1':
                case 'button2':
                    this.handleSelection();
                    break;
            }
            this.updateMenuDisplay();
        }

        this.keyboardHandler = new KeyboardHandler(inputHandler);
        this.screenControlHandler = new ScreenControlHandler(inputHandler);
    }

    private setupMenuShips(): void {
        // Create 3 regular enemy ships
        for (let i = 0; i < 4; i++) {
            const ship = new EnemyShip();
            const group = ship.getGroup();
            group.position.set(
                (Math.random() * 20) - 10, // Random X between -10 and 10
                (Math.random() * 10) - 5,  // Random Y between -5 and 5
                -2 // Behind the menu
            );
            this.scene.add(group);
            this.menuShips.push(group);
        }

        // Create 2 fast enemy ships
        for (let i = 0; i < 2; i++) {
            const ship = new FastEnemyShipModel();
            const group = ship.getGroup();
            group.position.set(
                (Math.random() * 20) - 10,
                (Math.random() * 10) - 5,
                -2
            );
            this.scene.add(group);
            this.menuShips.push(group);
        }
    }

    private updateMenuShips(deltaTime: number): void {
        this.menuShips.forEach((ship, index) => {
            // Calculate current position
            const time = Date.now() * 0.0005 + index;
            const radius = 3 + (index % 2) * 2; // Different radius for each ship
            const speed = 0.5 + (index % 2) * 0.3; // Different speed for each ship

            const currentX = Math.cos(time * speed) * radius;
            const currentY = Math.sin(time * speed) * radius;

            // Calculate next position (for direction)
            const nextTime = time + 0.1; // Small time step ahead
            const nextX = Math.cos(nextTime * speed) * radius;
            const nextY = Math.sin(nextTime * speed) * radius;

            // Calculate angle between current and next position
            const angle = Math.atan2(nextY - currentY, nextX - currentX);

            // Update position
            ship.position.x = currentX;
            ship.position.y = currentY;

            // Update rotation to point in direction of travel
            // Add PI/2 because the ships are rotated 90 degrees by default
            ship.rotation.y = angle + Math.PI / 2;

            // Add a gentle rocking motion on top of the direction
            // ship.rotation.z += Math.sin(Date.now() * 0.001 + index) * 0.05;
        });
    }

    private handleSelection(): void {
        switch (this.selectedOption) {
            case 0: // Start Game
                const playState = new PlayState(this.scene, this.camera, this.renderer);
                playState.setGameStateManager(this.gameStateManager);
                this.gameStateManager.setState(playState);
                break;
            case 1: // High Scores
                // To be implemented later
                break;
        }
    }

    private updateMenuDisplay(): void {
        this.menuContainer.innerHTML = `
            <style>
                @keyframes gentleRotate {
                    0% { transform: rotate(-2deg); }
                    50% { transform: rotate(2deg); }
                    100% { transform: rotate(-2deg); }
                }
                .title {
                    font-size: 72px;
                    font-weight: bold;
                    margin-bottom: 40px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                    animation: gentleRotate 3s ease-in-out infinite;
                    display: inline-block;
                }
            </style>
            <div class="title">Plane Panic</div>
            ${this.options.map((option, index) => 
                `<div style="margin: 20px; cursor: pointer; ${index === this.selectedOption ? 'color: #ff0000;' : ''}">${option}</div>`
            ).join('')}
        `;
    }

    enter(): void {
        this.setupBackground();
        this.updateMenuDisplay();
        this.audioSystem.playMenuMusic();
    }

    exit(): void {
        this.menuContainer.remove();
        this.audioSystem.stopMenuMusic();
        this.audioSystem.cleanup();
        
        // Remove menu ships
        this.menuShips.forEach(ship => {
            this.scene.remove(ship);
        });
        this.menuShips = [];

        if (this.backgroundTexture) {
            this.backgroundTexture.dispose();
            this.backgroundTexture = null;
        }
        this.scene.background = null;

        this.screenControlHandler?.destroy();
    }

    update(): void {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = currentTime;

        this.keyboardHandler.update();
        this.updateMenuShips(deltaTime);
    }

    render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    setGameStateManager(manager: GameStateManager): void {
        this.gameStateManager = manager;
    }
} 