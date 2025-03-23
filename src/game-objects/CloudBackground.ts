import * as THREE from 'three';
import { GameObject } from './GameObject.js';

export class CloudBackground extends GameObject {
    private clouds: THREE.Mesh[] = [];
    private readonly cloudCount = 40;
    private readonly moveSpeed = 2;
    private readonly cloudRadius = 0.5;
    private readonly cloudHeight = 4; // Position at bottom of screen
    private readonly cloudSpacing = 0.8;
    private readonly maxYVariation = 0.2; // Maximum random variation in Y position
    private readonly viewportWidth = 25; // Approximate viewport width

    constructor() {
        super();
        this.init();
    }

    protected init(): void {
        // Create cloud material
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });

        // Create clouds
        for (let i = 0; i < this.cloudCount; i++) {
            const cloud = new THREE.Mesh(
                new THREE.SphereGeometry(this.cloudRadius, 16, 16),
                cloudMaterial
            );
            
            // Calculate random Y variation
            const yVariation = (Math.random() * 2 - 1) * this.maxYVariation; // Random value between -maxYVariation and +maxYVariation
            
            // Position clouds across the viewport width, starting from the left
            cloud.position.set(
                -this.viewportWidth/2 + (i * this.cloudSpacing), // Start from left side of viewport
                -this.cloudHeight + yVariation, // Position at bottom with random variation
                0
            );
            
            this.clouds.push(cloud);
            this.group.add(cloud);
        }
    }

    public update(deltaTime: number): void {
        // Move clouds from right to left
        this.clouds.forEach(cloud => {
            cloud.position.x -= this.moveSpeed * deltaTime;
            
            // Reset cloud position when it moves off screen
            if (cloud.position.x < -this.viewportWidth/2 - this.cloudSpacing) {
                cloud.position.x = this.viewportWidth/2 + this.cloudSpacing;
                // Add new random Y variation when cloud resets
                const yVariation = (Math.random() * 2 - 1) * this.maxYVariation;
                cloud.position.y = -this.cloudHeight + yVariation;
            }
        });
    }
} 