import create from 'zustand';

interface IdStoreState {
   Id: string;
    setId: (value: string) => void;
    updateId: (value: string) => void;
}

const useIdStore = create<IdStoreState>((set) => ({
   Id: '', // Initial state
    setId: (value: string) => set({ Id: value }),
    updateId: (value: string) => set((state) => ({
        Id: state.Id ? state.Id : value // Only update if not already set
    })),
}));

export default useIdStore;