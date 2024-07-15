import create from 'zustand';

interface TokenStoreState {
    Token: string;
    setToken: (value: string) => void;
    updateToken: (value: string) => void;
}

const useTokenStore = create<TokenStoreState>((set) => ({
    Token: '', // Initial state
    setToken: (value: string) => set({ Token: value }),
    updateToken: (value: string) => set((state) => ({
        Token: state.Token ? state.Token : value // Only update if not already set
    })),
}));

export default useTokenStore;