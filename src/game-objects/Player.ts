import * as THREE from 'three';
import { Spaceship } from '../game-models/Spaceship';
import { BulletSystem } from '../system/BulletSystem';

export class Player {
    private model: Spaceship;
    private group: THREE.Group;
    private moveSpeed: number = 0.1;
    private bulletSystem: BulletSystem | null = null;
    private lastSpacePress: number = 0;
    private fireRate: number = 250; // Minimum time between shots in milliseconds
    private initialPosition: THREE.Vector3;
    private lives: number = 3;
    private isGameOver: boolean = false;

    constructor(spaceship: Spaceship) {
        this.model = spaceship;
        this.group = new THREE.Group();
        this.group.add(this.model.getGroup());
        this.initialPosition = new THREE.Vector3(0, 0, 0);
    }

    public setBulletSystem(bulletSystem: BulletSystem): void {
        this.bulletSystem = bulletSystem;
    }

    public update(): void {
        if (this.isGameOver) return;
        this.model.update();
    }

    public getGroup(): THREE.Group {
        return this.group;
    }

    public getPosition(): THREE.Vector3 {
        return this.group.position;
    }

    public resetPosition(): void {
        this.group.position.copy(this.initialPosition);
    }

    public moveUp(): void {
        this.group.position.y += this.moveSpeed;
    }

    public moveDown(): void {
        this.group.position.y -= this.moveSpeed;
    }

    public moveLeft(): void {
        this.group.position.x -= this.moveSpeed;
    }

    public moveRight(): void {
        this.group.position.x += this.moveSpeed;
    }

    public shoot(): void {
        if (!this.bulletSystem) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastSpacePress >= this.fireRate) {
            const playerPosition = this.group.position;
            // Spawn bullet in front of the ship (along X axis since ship is rotated 90 degrees around Y)
            const bulletPosition = new THREE.Vector3(
                playerPosition.x + 1.5, // Spawn 1.5 units in front of the ship
                playerPosition.y,
                playerPosition.z
            );
            this.bulletSystem.spawnBullet(bulletPosition);
            this.lastSpacePress = currentTime;
        }
    }

    public getLives(): number {
        return this.lives;
    }

    public isDead(): boolean {
        return this.lives <= 0;
    }

    public takeDamage(): void {
        this.lives--;
        if (this.lives <= 0) {
            this.isGameOver = true;
            this.hideShip();
        }
    }

    public reset(): void {
        this.lives = 3;
        this.isGameOver = false;
        this.resetPosition();
    }

    public setGameOver(): void {
        this.isGameOver = true;
        this.hideShip();
    }

    private hideShip(): void {
        this.group.visible = false;
    }
} 