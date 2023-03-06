

declare module '*.html' {
    const value: string;
    export default value
}

interface Window{
    TS: TS;
    
}

interface TS {
    deleteAllSaves: () => void
    game: import("@src/game/Game").default;
}