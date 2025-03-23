import * as THREE from 'three';

export abstract class GameObject {
    protected group: THREE.Group;

    constructor() {
        this.group = new THREE.Group();
    }

    protected abstract init(): void;
    public abstract update(deltaTime: number): void;

    public getGroup(): THREE.Group {
        return this.group;
    }
} 