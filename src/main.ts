import './style.css'
import * as THREE from 'three';
import { KeyboardHandler } from './system/KeyboardHandler';
import { GameStateManager } from './game-states/GameStateManager';
import { PlayState } from './game-states/PlayState';
import { MenuState } from './game-states/MenuState';

// Create scene, camera, and renderer
const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights
const light: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Position camera
camera.position.z = 5;

// Create game over screen
const gameOverScreen = document.createElement('div');
gameOverScreen.className = 'game-over';
gameOverScreen.innerHTML = 'GAME OVER<br/>Press RETURN to restart';
document.body.appendChild(gameOverScreen);

// Game state
let isGameOver: boolean = false;

function resetGame(): void {
    // Hide game over screen
    gameOverScreen.classList.remove('visible');
    
    // Reset game state
    isGameOver = false;
}

// Create game state manager
const gameStateManager = new GameStateManager(scene, camera, renderer);

// Create and set initial state
const menuState = new MenuState(scene, camera, renderer);
menuState.setGameStateManager(gameStateManager);
gameStateManager.setState(menuState);

let lastTime = 0;

// Animation loop
function animate(currentTime: number): void {
    requestAnimationFrame(animate);
    
    // Calculate deltaTime in seconds
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    gameStateManager.update(deltaTime);
    gameStateManager.render();
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// Start animation
animate(0); 