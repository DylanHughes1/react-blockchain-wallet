import { create } from "zustand";

type MintState = {
    mintTo: string;
    mintAmount: string;
};

type MintActions = {
    setMintTo: (address: string) => void;
    setMintAmount: (amount: string) => void;
    resetMint: () => void;
};

export type AppState = {
    mint: MintState;
} & MintActions;

export const useAppStore = create<AppState>((set) => ({
    mint: {
        mintTo: "",
        mintAmount: "",
    },
    setMintTo: (address: string) =>
        set((state) => ({ ...state, mint: { ...state.mint, mintTo: address } })),
    setMintAmount: (amount: string) =>
        set((state) => ({ ...state, mint: { ...state.mint, mintAmount: amount } })),
    resetMint: () => set((state) => ({ ...state, mint: { mintTo: "", mintAmount: "" } })),
}));


