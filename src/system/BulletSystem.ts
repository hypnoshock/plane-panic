import * as THREE from 'three';
import { Bullet as BulletModel } from '../game-models/Bullet';
import { Bullet } from '../game-objects/Bullet';
import { Player } from '../game-objects/Player';
import { Enemy } from '../game-objects/Enemy';
import { ScoreSystem } from './ScoreSystem';
import { EnemySpawner } from './EnemySpawner';
import { ExplosionSystem } from './ExplosionSystem';
import { AudioSystem } from './AudioSystem';

export class BulletSystem {
    private bullets: Bullet[] = [];
    private scene: THREE.Scene;
    private player: Player | null = null;
    private enemies: Enemy[] = [];
    private scoreSystem: ScoreSystem;
    private enemySpawner: EnemySpawner | null = null;
    private explosionSystem: ExplosionSystem;
    private audioSystem: AudioSystem;

    constructor(scene: THREE.Scene, explosionSystem: ExplosionSystem, audioSystem: AudioSystem) {
        this.scene = scene;
        this.scoreSystem = new ScoreSystem();
        this.explosionSystem = explosionSystem;
        this.audioSystem = audioSystem;
    }

    public setPlayer(player: Player): void {
        this.player = player;
    }

    public setEnemySpawner(enemySpawner: EnemySpawner): void {
        this.enemySpawner = enemySpawner;
    }

    public spawnBullet(position: THREE.Vector3, direction: THREE.Vector3, isEnemy: boolean): void {
        const bulletModel = new BulletModel();
        const bullet = new Bullet(bulletModel, direction, isEnemy);
        bullet.setPosition(position.x, position.y, position.z);
        this.scene.add(bullet.getGroup());
        this.bullets.push(bullet);
        
        // Play bullet sound effect
        this.audioSystem.playBullet();
    }

    public update(deltaTime: number): void {
        // Update all bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(deltaTime);
            
            const position = bullet.getGroup().position;
            const maxDistance = 20; // Maximum distance bullets can travel
            const collisionDistance = 1; // Distance at which collision is detected

            // Check if bullet is a player bullet and has hit any enemy
            if (!bullet.isEnemyBullet()) {
                for (const enemy of this.enemies) {
                    const enemyPosition = enemy.getPosition();
                    const distanceToEnemy = position.distanceTo(enemyPosition);
                    if (distanceToEnemy < collisionDistance) {
                        // First spawn the explosion at the enemy's current position
                        this.explosionSystem.spawnExplosion(enemyPosition);
                        
                        // Then handle the enemy destruction
                        this.removeEnemy(enemy);
                        this.scene.remove(enemy.getGroup());
                        this.scene.remove(bullet.getGroup());
                        this.scoreSystem.addScore(10); // Add 10 points when enemy is hit
                        // Notify the enemy spawner that this enemy was destroyed
                        if (this.enemySpawner) {
                            this.enemySpawner.removeEnemy(enemy);
                        }
                        return false;
                    }
                }
            }
            // Check if bullet is an enemy bullet and has hit the player
            else if (this.player) {
                const playerPosition = this.player.getPosition();
                const distanceToPlayer = position.distanceTo(playerPosition);
                if (distanceToPlayer < collisionDistance) {
                    this.scene.remove(bullet.getGroup());
                    this.player.takeDamage();
                    return false;
                }
            }

            // Remove bullets that have traveled too far
            if (position.length() > maxDistance) {
                this.scene.remove(bullet.getGroup());
                return false;
            }
            return true;
        });
    }

    public addEnemy(enemy: Enemy): void {
        this.enemies.push(enemy);
    }

    public removeEnemy(enemy: Enemy): void {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }

    public clearBullets(): void {
        this.bullets.forEach(bullet => {
            this.scene.remove(bullet.getGroup());
        });
        this.bullets = [];
    }

    public resetScore(): void {
        this.scoreSystem.resetScore();
    }

    public getScore(): number {
        return this.scoreSystem.getScore();
    }

    public cleanup(): void {
        this.scoreSystem.cleanup();
    }
} 