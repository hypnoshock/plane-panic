import * as THREE from 'three';
import { Enemy } from '../game-objects/Enemy';
import { FastEnemy } from '../game-objects/FastEnemy';
import { BigDumper } from '../game-objects/BigDumper';
import { BulletSystem } from './BulletSystem';

export class EnemySpawner {
    private enemies: (Enemy | FastEnemy | BigDumper)[] = [];
    private scene: THREE.Scene;
    private bulletSystem: BulletSystem;
    private minSpawnInterval: number = 1000; // Minimum spawn interval in ms
    private maxSpawnInterval: number = 3000; // Maximum spawn interval in ms
    private spawnInterval: number = 2000; // Current spawn interval
    private lastSpawnTime: number = 0;

    constructor(scene: THREE.Scene, bulletSystem: BulletSystem) {
        this.scene = scene;
        this.bulletSystem = bulletSystem;
    }

    public update(deltaTime: number): void {
        const currentTime = Date.now();

        // Spawn new enemies
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnEnemy();
            this.lastSpawnTime = currentTime;
            // Set new random spawn interval
            this.spawnInterval = Math.random() * (this.maxSpawnInterval - this.minSpawnInterval) + this.minSpawnInterval;
        }

        // Update all enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(deltaTime);
            
            // Move enemy from right to left
            const position = enemy.getGroup().position;

            // Remove enemy if it's gone off screen
            if (position.x < -10) {
                this.scene.remove(enemy.getGroup());
                this.bulletSystem.removeEnemy(enemy);
                return false;
            }

            return true;
        });
    }

    private spawnEnemy(): void {
        // Random number between 0 and 1
        const random = Math.random();
        let enemy;
        
        // 20% chance for fast enemy, 10% for big dumper, 70% for regular enemy
        if (random < 0.2) {
            enemy = new FastEnemy(this.bulletSystem);
            // Position enemy off the right side of the screen
            const randomY = (Math.random() * 8) - 4; // Random Y between -4 and 4
            const initialPosition = new THREE.Vector3(10, randomY, 0);
            enemy.setPosition(initialPosition);
        } else if (random < 0.3) {
            enemy = new BigDumper(this.bulletSystem);
            const initialPosition = new THREE.Vector3(10, 3, 0);
            enemy.setPosition(initialPosition);
        } else {
            enemy = new Enemy(this.bulletSystem);
            // Position enemy off the right side of the screen
            const randomY = (Math.random() * 8) - 4; // Random Y between -4 and 4
            const initialPosition = new THREE.Vector3(10, randomY, 0);
            enemy.setPosition(initialPosition);
        }
        
        
        this.scene.add(enemy.getGroup());
        this.enemies.push(enemy);
        this.bulletSystem.addEnemy(enemy);
    }

    public clearEnemies(): void {
        this.enemies.forEach(enemy => {
            this.scene.remove(enemy.getGroup());
            this.bulletSystem.removeEnemy(enemy);
        });
        this.enemies = [];
    }

    public removeEnemy(enemy: Enemy | FastEnemy | BigDumper): void {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }
} 