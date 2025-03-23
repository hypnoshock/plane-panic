import * as THREE from 'three';
import { Bullet as BulletModel } from '../game-models/Bullet';
import { Bullet } from '../game-objects/Bullet';
import { Player } from '../game-objects/Player';
import { Enemy } from '../game-objects/Enemy';
import { ScoreSystem } from './ScoreSystem';
import { EnemySpawner } from './EnemySpawner';

export class BulletSystem {
    private bullets: Bullet[] = [];
    private scene: THREE.Scene;
    private player: Player | null = null;
    private enemies: Enemy[] = [];
    private scoreSystem: ScoreSystem;
    private enemySpawner: EnemySpawner | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.scoreSystem = new ScoreSystem();
    }

    public setEnemySpawner(spawner: EnemySpawner): void {
        this.enemySpawner = spawner;
    }

    public setPlayer(player: Player): void {
        this.player = player;
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

    public spawnBullet(position: THREE.Vector3, isEnemy: boolean = false): void {
        const bulletModel = new BulletModel();
        const bullet = new Bullet(bulletModel, isEnemy);
        bullet.setPosition(position.x, position.y, position.z);
        this.scene.add(bullet.getGroup());
        this.bullets.push(bullet);
    }

    public update(): void {
        // Update all bullets
        this.bullets.forEach(bullet => bullet.update());

        if (!this.player) return;

        // Check for collisions with player and enemies
        const playerPosition = this.player.getPosition();
        const collisionDistance = 1.0; // Adjust this value based on your game's scale

        // Remove bullets that have gone too far or hit targets
        this.bullets = this.bullets.filter(bullet => {
            const position = bullet.getGroup().position;
            const maxDistance = 20;

            // Check if bullet is an enemy bullet and has hit the player
            if (bullet.isEnemyBullet()) {
                const distanceToPlayer = position.distanceTo(playerPosition);
                if (distanceToPlayer < collisionDistance) {
                    this.player!.takeDamage();
                    this.scene.remove(bullet.getGroup());
                    return false;
                }
            } 
            // Check if bullet is a player bullet and has hit any enemy
            else {
                for (const enemy of this.enemies) {
                    const enemyPosition = enemy.getPosition();
                    const distanceToEnemy = position.distanceTo(enemyPosition);
                    if (distanceToEnemy < collisionDistance) {
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

            // Remove bullets that have traveled too far
            if (Math.abs(position.x) > maxDistance) {
                this.scene.remove(bullet.getGroup());
                return false;
            }
            return true;
        });
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
} 