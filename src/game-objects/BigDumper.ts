import * as THREE from 'three';
import { Enemy } from './Enemy';
import { BigDumperModel } from '../game-models/BigDumperModel';
import { BulletSystem } from '../system/BulletSystem';

export class BigDumper extends Enemy {
    constructor(bulletSystem: BulletSystem, initialPosition?: THREE.Vector3) {
        super(bulletSystem, initialPosition);
        this.moveSpeed = 3; // Slower than regular enemies due to size
    }

    protected init(): void {
        this.model = new BigDumperModel();
        this.group = new THREE.Group();
        this.group.add(this.model.getGroup());
        
        // No rotation needed since we want it to face right like the player
        // this.group.rotation.y = Math.PI;

        // Set initial position
        this.group.position.copy(this.initialPosition);
    }

    public update(deltaTime: number): void {
        this.model.update();
        
        // Move straight towards the player (right)
        this.group.position.x += this.moveSpeed * deltaTime;

        // Try to shoot
        this.tryShoot();
    }

    protected tryShoot(): void {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.fireRate) {
            const enemyPosition = this.group.position;
            // Spawn bullet below the ship
            const bulletPosition = new THREE.Vector3(
                enemyPosition.x,
                enemyPosition.y - 1.5, // Spawn 1.5 units below the ship
                enemyPosition.z
            );
            // Shoot downward
            const direction = new THREE.Vector3(0, -1, 0);
            this.bulletSystem.spawnBullet(bulletPosition, direction, true);
            this.lastShotTime = currentTime;
        }
    }
} 