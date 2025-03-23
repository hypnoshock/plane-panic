import './style.css'
import * as THREE from 'three';
import { Spaceship } from './game-models/Spaceship';
import { Player } from './game-objects/Player';
import { Enemy } from './game-objects/Enemy';
import { KeyboardHandler } from './system/KeyboardHandler';
import { BulletSystem } from './system/BulletSystem';
import { EnemySpawner } from './system/EnemySpawner';

// Create scene, camera, and renderer
const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create gradient texture
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

const texture = new THREE.CanvasTexture(canvas);
texture.needsUpdate = true;
scene.background = texture;

// Create bullet system
const bulletSystem: BulletSystem = new BulletSystem(scene);

// Create player with spaceship
const spaceship: Spaceship = new Spaceship();
const player: Player = new Player(spaceship);
player.setBulletSystem(bulletSystem);
bulletSystem.setPlayer(player);
scene.add(player.getGroup());

// Create enemy spawner
const enemySpawner: EnemySpawner = new EnemySpawner(scene, bulletSystem);
bulletSystem.setEnemySpawner(enemySpawner);

// Create keyboard handler
const keyboardHandler: KeyboardHandler = new KeyboardHandler(player, resetGame);

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

// Create energy display
const energyDisplay = document.createElement('div');
energyDisplay.style.position = 'absolute';
energyDisplay.style.top = '20px';
energyDisplay.style.left = '20px';
energyDisplay.style.color = 'white';
energyDisplay.style.fontSize = '24px';
energyDisplay.style.fontFamily = 'Arial, sans-serif';
energyDisplay.textContent = 'Energy: 3';
document.body.appendChild(energyDisplay);

// Game state
let isGameOver: boolean = false;

function resetGame(): void {
    // Reset player
    player.reset();
    player.getGroup().visible = true;
    
    // Clear all enemies
    enemySpawner.clearEnemies();
    
    // Clear all bullets
    bulletSystem.clearBullets();
    
    // Reset score
    bulletSystem.resetScore();
    
    // Hide game over screen
    gameOverScreen.classList.remove('visible');
    
    // Reset game state
    isGameOver = false;
}

// Animation loop
function animate(): void {
    requestAnimationFrame(animate);

    // Update player, keyboard handler, bullet system, and enemy spawner
    player.update();
    keyboardHandler.update();
    bulletSystem.update();
    enemySpawner.update();

    // Update energy display
    energyDisplay.textContent = `Energy: ${player.getLives()}`;

    // Check for game over
    if (player.isDead() && !isGameOver) {
        isGameOver = true;
        gameOverScreen.classList.add('visible');
        player.setGameOver();
    }

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start animation
animate(); 