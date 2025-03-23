import { GameState } from './GameState';
import * as THREE from 'three';
import { GameStateManager } from './GameStateManager';
import { PlayState } from './PlayState';
import { KeyboardHandler } from '../system/KeyboardHandler';
import { AudioSystem } from '../system/AudioSystem';

export class MenuState implements GameState {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private gameStateManager!: GameStateManager;
    private menuContainer!: HTMLDivElement;
    private selectedOption: number = 0;
    private options: string[] = ['Start Game', 'High Scores'];
    private keyboardHandler!: KeyboardHandler;
    private backgroundTexture: THREE.CanvasTexture | null = null;
    private audioSystem: AudioSystem;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.audioSystem = new AudioSystem();
        this.setupMenu();
        this.setupKeyboardHandler();
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

    private setupKeyboardHandler(): void {
        this.keyboardHandler = new KeyboardHandler((event: string, isPress: boolean) => {
            // Only handle press events for the menu
            if (!isPress) return;

            switch (event) {
                case 'up':
                    this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
                    break;
                case 'down':
                    this.selectedOption = (this.selectedOption + 1) % this.options.length;
                    break;
                case 'button2':
                    this.handleSelection();
                    break;
            }
            this.updateMenuDisplay();
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
        if (this.backgroundTexture) {
            this.backgroundTexture.dispose();
            this.backgroundTexture = null;
        }
        this.scene.background = null;
    }

    update(): void {
        this.keyboardHandler.update();
    }

    render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    setGameStateManager(manager: GameStateManager): void {
        this.gameStateManager = manager;
    }
} 