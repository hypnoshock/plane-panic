import * as THREE from 'three';
import { Spaceship } from './Spaceship';

export class BigDumperModel extends Spaceship {
    constructor() {
        super();
        
        // Get the group and update materials to yellow
        const group = this.getGroup();
        
        // Scale the entire group to make it twice the size
        group.scale.set(2, 2, 2);
        
        group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
            }
        });
    }
} 