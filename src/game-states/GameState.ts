import { KeyboardHandler } from '../system/KeyboardHandler';
import { ScreenControlHandler } from '../system/ScreenControlHandler';
import { JoypadInputHandler } from '../system/JoypadInputHandler';

export interface GameState {
    enter(): void;
    exit(): void;
    update(deltaTime: number): void;
    render(): void;
    setInputHandlers(
        keyboardHandler: KeyboardHandler,
        screenControlHandler: ScreenControlHandler,
        joypadHandler: JoypadInputHandler
    ): void;
} 