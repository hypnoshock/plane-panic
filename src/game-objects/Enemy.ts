import * as THREE from 'three';
import { EnemyShip } from '../game-models/EnemyShip';
import { BulletSystem } from '../system/BulletSystem';

export class Enemy {
    private model: EnemyShip;
    private group: THREE.Group;
    private moveSpeed: number = 2; // Units per second
    private direction: number = 1; // 1 for moving up, -1 for moving down
    private bulletSystem: BulletSystem;
    private lastShotTime: number = 0;
    private fireRate: number = 1000; // Shoot every second
    private initialPosition: THREE.Vector3;

    constructor(bulletSystem: BulletSystem, initialPosition?: THREE.Vector3) {
        this.model = new EnemyShip();
        this.bulletSystem = bulletSystem;
        this.group = new THREE.Group();
        this.group.add(this.model.getGroup());
        
        // Rotate the enemy ship to face the player
        this.group.rotation.y = Math.PI;

        // Set initial position
        this.initialPosition = initialPosition || new THREE.Vector3(0, 2, 0);
        this.group.position.copy(this.initialPosition);
    }

    public update(deltaTime: number): void {
        this.model.update();
        
        // Move the enemy up and down
        this.group.position.y += this.moveSpeed * deltaTime * this.direction;
        this.group.position.x -= this.moveSpeed * deltaTime;
        
        // Change direction when reaching boundaries
        // Get absolute distance from current position to initial position
        const distanceFromStart = Math.abs(this.group.position.y - this.initialPosition.y);
        
        // Change direction when moving 2 units away from initial position in either direction
        if (distanceFromStart >= 2) {
            this.direction *= -1;
        }

        // Try to shoot
        this.tryShoot();
    }

    public respawn(): void {
        this.group.position.copy(this.initialPosition);
        this.direction = 1; // Reset direction to moving up
    }

    private tryShoot(): void {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.fireRate) {
            const enemyPosition = this.group.position;
            // Spawn bullet behind the ship (since it's facing the player)
            const bulletPosition = new THREE.Vector3(
                enemyPosition.x - 1.5, // Spawn 1.5 units behind the ship
                enemyPosition.y,
                enemyPosition.z
            );
            this.bulletSystem.spawnBullet(bulletPosition, true);
            this.lastShotTime = currentTime;
        }
    }

    public getGroup(): THREE.Group {
        return this.group;
    }

    public getPosition(): THREE.Vector3 {
        return this.group.position;
    }

    public setPosition(position: THREE.Vector3): void {
        this.group.position.copy(position);
        this.initialPosition.copy(position);
    }
} 