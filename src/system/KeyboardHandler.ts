import { Player } from '../game-objects/Player';

type KeyboardEventHandler = (event: string, isPress: boolean) => void;

export class KeyboardHandler {
    private keys: Set<string> = new Set();
    private pressedKeys: Set<string> = new Set();
    private eventHandler: KeyboardEventHandler;

    constructor(eventHandler: KeyboardEventHandler) {
        this.eventHandler = eventHandler;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            // Only handle game control keys
            if (['w', 'a', 's', 'd', ' ', 'enter'].includes(key)) {
                event.preventDefault();
                event.stopPropagation();
                if (!this.keys.has(key)) {
                    this.pressedKeys.add(key);
                }
                this.keys.add(key);
            }
        });

        window.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            // Only handle game control keys
            if (['w', 'a', 's', 'd', ' ', 'enter'].includes(key)) {
                event.preventDefault();
                event.stopPropagation();
                this.keys.delete(key);
            }
        });
    }

    public update(): void {
        // First handle all press events
        this.pressedKeys.forEach((key) => {
            switch (key) {
                case 'w':
                    this.eventHandler('up', true);
                    break;
                case 's':
                    this.eventHandler('down', true);
                    break;
                case 'a':
                    this.eventHandler('left', true);
                    break;
                case 'd':
                    this.eventHandler('right', true);
                    break;
                case ' ':
                    this.eventHandler('button1', true);
                    break;
                case 'enter':
                    this.eventHandler('button2', true);
                    break;
            }
        });

        // Clear pressed keys after handling them
        this.pressedKeys.clear();

        // Then handle all hold events
        this.keys.forEach((key) => {
            switch (key) {
                case 'w':
                    this.eventHandler('up', false);
                    break;
                case 's':
                    this.eventHandler('down', false);
                    break;
                case 'a':
                    this.eventHandler('left', false);
                    break;
                case 'd':
                    this.eventHandler('right', false);
                    break;
                case ' ':
                    this.eventHandler('button1', false);
                    break;
                case 'enter':
                    this.eventHandler('button2', false);
                    break;
            }
        });
    }
} 