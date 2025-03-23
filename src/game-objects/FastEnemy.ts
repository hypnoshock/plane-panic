import * as THREE from 'three';
import { Enemy } from './Enemy';
import { FastEnemyShipModel } from '../game-models/FastEnemyShipModel';
import { BulletSystem } from '../system/BulletSystem';

export class FastEnemy extends Enemy {
    constructor(bulletSystem: BulletSystem, initialPosition?: THREE.Vector3) {
        super(bulletSystem, initialPosition);
        this.moveSpeed = 6;
    }

    protected init(): void {
        this.model = new FastEnemyShipModel();
        this.group = new THREE.Group();
        this.group.add(this.model.getGroup());
        
        // Rotate the enemy ship to face the player
        this.group.rotation.y = Math.PI;

        // Set initial position
        this.group.position.copy(this.initialPosition);
    }

    public update(deltaTime: number): void {
        this.model.update();
        
        // Move straight towards the player (left)
        this.group.position.x -= this.moveSpeed * deltaTime;

        // Try to shoot
        this.tryShoot();
    }
} 