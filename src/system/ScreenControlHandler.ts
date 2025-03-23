type ScreenControlEventHandler = (event: string, isPress: boolean) => void;

export class ScreenControlHandler {
    private eventHandler: ScreenControlEventHandler;
    private container: HTMLDivElement = document.createElement('div');
    private directionPad: HTMLDivElement = document.createElement('div');
    private button1: HTMLDivElement = document.createElement('div');
    private button2: HTMLDivElement = document.createElement('div');
    private isActive: boolean = false;

    constructor(eventHandler: ScreenControlEventHandler) {
        this.eventHandler = eventHandler;
        this.createControls();
        this.setupEventListeners();
        
        // Hide controls by default on non-mobile devices
        if (!this.isMobileDevice()) {
            this.hideControls();
        }
    }

    private isMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    public showControls(): void {
        this.container.style.display = 'flex';
    }

    public hideControls(): void {
        this.container.style.display = 'none';
    }

    public toggleControls(): void {
        if (this.container.style.display === 'none') {
            this.showControls();
        } else {
            this.hideControls();
        }
    }

    private createControls(): void {
        // Create main container
        this.container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
            pointer-events: none;
            z-index: 1000;
        `;

        // Create direction pad
        this.directionPad.style.cssText = `
            width: 150px;
            height: 150px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            position: relative;
            pointer-events: auto;
        `;

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 20px;
            pointer-events: auto;
        `;

        // Create button 1
        this.button1.style.cssText = `
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        `;
        this.button1.textContent = 'A';

        // Create button 2
        this.button2.style.cssText = `
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        `;
        this.button2.textContent = 'B';

        // Assemble the controls
        buttonsContainer.appendChild(this.button1);
        buttonsContainer.appendChild(this.button2);
        this.container.appendChild(this.directionPad);
        this.container.appendChild(buttonsContainer);
        document.body.appendChild(this.container);
    }

    private setupEventListeners(): void {
        // Direction pad events
        this.directionPad.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isActive = true;
            this.handleDirectionPadTouch(e);
        });

        this.directionPad.addEventListener('touchmove', (e) => {
            if (!this.isActive) return;
            e.preventDefault();
            this.handleDirectionPadTouch(e);
        });

        this.directionPad.addEventListener('touchend', () => {
            this.isActive = false;
            this.eventHandler('up', false);
            this.eventHandler('down', false);
            this.eventHandler('left', false);
            this.eventHandler('right', false);
        });

        // Button 1 events
        this.button1.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.eventHandler('button1', true);
        });

        this.button1.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.eventHandler('button1', false);
        });

        // Button 2 events
        this.button2.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.eventHandler('button2', true);
        });

        this.button2.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.eventHandler('button2', false);
        });
    }

    private handleDirectionPadTouch(e: TouchEvent): void {
        const touch = e.touches[0];
        const rect = this.directionPad.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = touch.clientX - centerX;
        const deltaY = touch.clientY - centerY;
        
        // Calculate distance from center
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Only trigger if touch is outside dead zone (20% of radius)
        if (distance > rect.width * 0.2) {
            // Normalize the direction vector
            const normalizedX = deltaX / distance;
            const normalizedY = deltaY / distance;

            // Use thresholds to determine direction
            const threshold = 0.5; // Adjust this value to change sensitivity

            // Horizontal movement
            if (normalizedX > threshold) {
                this.eventHandler('right', true);
                this.eventHandler('left', false);
            } else if (normalizedX < -threshold) {
                this.eventHandler('left', true);
                this.eventHandler('right', false);
            } else {
                this.eventHandler('left', false);
                this.eventHandler('right', false);
            }

            // Vertical movement
            if (normalizedY > threshold) {
                this.eventHandler('down', true);
                this.eventHandler('up', false);
            } else if (normalizedY < -threshold) {
                this.eventHandler('up', true);
                this.eventHandler('down', false);
            } else {
                this.eventHandler('up', false);
                this.eventHandler('down', false);
            }
        } else {
            // Reset all directions when in dead zone
            this.eventHandler('left', false);
            this.eventHandler('right', false);
            this.eventHandler('up', false);
            this.eventHandler('down', false);
        }
    }

    public update(): void {
        // No need to do anything in update
        // All control handling is done through touch events
    }

    public destroy(): void {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
} 