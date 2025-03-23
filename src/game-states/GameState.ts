export interface GameState {
    enter(): void;
    exit(): void;
    update(): void;
    render(): void;
} 