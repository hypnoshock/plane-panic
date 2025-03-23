import * as THREE from 'three';
import { Spaceship } from './Spaceship';

export class EnemyShip extends Spaceship {
    constructor() {
        super();
        
        // Get the group and update materials to red
        const group = this.getGroup();
        group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            }
        });
    }
} 