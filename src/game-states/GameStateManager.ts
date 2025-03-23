import * as THREE from 'three';
import { GameState } from './GameState';

export class GameStateManager {
    private currentState: GameState | null = null;

    constructor(private scene: THREE.Scene, private camera: THREE.PerspectiveCamera, private renderer: THREE.WebGLRenderer) {}

    public setState(state: GameState): void {
        if (this.currentState) {
            this.currentState.exit();
        }
        this.currentState = state;
        this.currentState.enter();
    }

    public update(deltaTime: number): void {
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    }

    public render(): void {
        if (this.currentState) {
            this.currentState.render();
        }
    }
} 