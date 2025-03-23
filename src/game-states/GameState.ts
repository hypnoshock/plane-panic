export interface GameState {
    enter(): void;
    exit(): void;
    update(deltaTime: number): void;
    render(): void;
} 