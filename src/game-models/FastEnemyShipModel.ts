import * as THREE from 'three';
import { Spaceship } from './Spaceship';

export class FastEnemyShipModel extends Spaceship {
    constructor() {
        super();
        
        // Get the group and update materials to green
        const group = this.getGroup();
        
        group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
            }
        });
    }
} 