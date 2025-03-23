import { Player } from '../game-objects/Player';

export class KeyboardHandler {
    private player: Player;
    private keys: Set<string> = new Set();
    private onRestart: () => void;

    constructor(player: Player, onRestart: () => void) {
        this.player = player;
        this.onRestart = onRestart;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', (event) => {
            this.keys.add(event.key.toLowerCase());
        });

        window.addEventListener('keyup', (event) => {
            this.keys.delete(event.key.toLowerCase());
        });
    }

    public update(): void {
        if (this.player.isDead()) {
            // Handle restart when game is over
            if (this.keys.has('enter')) {
                this.onRestart();
            }
            return;
        }

        if (this.keys.has('w')) this.player.moveUp();
        if (this.keys.has('s')) this.player.moveDown();
        if (this.keys.has('a')) this.player.moveLeft();
        if (this.keys.has('d')) this.player.moveRight();

        // Handle shooting
        if (this.keys.has(' ')) {
            this.player.shoot();
        }
    }
} 