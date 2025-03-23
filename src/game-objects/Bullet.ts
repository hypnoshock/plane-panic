import * as THREE from 'three';
import { Bullet as BulletModel } from '../game-models/Bullet';

export class Bullet {
    private model: BulletModel;
    private group: THREE.Group;
    private speed: number = 0.2;
    private isEnemy: boolean;

    constructor(bullet: BulletModel, isEnemy: boolean = false) {
        this.model = bullet;
        this.isEnemy = isEnemy;
        this.group = new THREE.Group();
        this.group.add(this.model.getMesh());
    }

    public update(): void {
        // Move the bullet forward or backward depending on isEnemy flag
        this.group.position.x += this.speed * (this.isEnemy ? -1 : 1);
    }

    public getGroup(): THREE.Group {
        return this.group;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.group.position.set(x, y, z);
    }

    public isEnemyBullet(): boolean {
        return this.isEnemy;
    }
} 