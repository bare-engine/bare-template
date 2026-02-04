import type { Game } from './game';

declare global {
    const __DEV__: boolean;
}

declare module 'bare-engine' {
    export interface GameInstance extends Game {}
}

export {};
