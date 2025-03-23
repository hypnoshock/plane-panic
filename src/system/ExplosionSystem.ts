import * as THREE from 'three';
import { Explosion } from '../game-objects/Explosion';

export class ExplosionSystem {
    private explosions: Explosion[] = [];
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public spawnExplosion(position: THREE.Vector3): void {
        const explosion = new Explosion();
        explosion.setPosition(position.x, position.y, position.z);
        this.scene.add(explosion.getGroup());
        this.explosions.push(explosion);
        console.log('Current active explosions:', this.explosions.length);
    }

    public update(deltaTime: number): void {
        // Update all explosions and remove finished ones
        this.explosions = this.explosions.filter(explosion => {
            const isActive = explosion.update(deltaTime);
            if (!isActive) {
                console.log('Removing finished explosion');
                this.scene.remove(explosion.getGroup());
            }
            return isActive;
        });
    }

    public cleanup(): void {
        this.explosions.forEach(explosion => {
            this.scene.remove(explosion.getGroup());
        });
        this.explosions = [];
    }
} 