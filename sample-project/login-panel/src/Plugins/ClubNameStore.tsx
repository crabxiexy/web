import create from 'zustand';

interface ClubNameStoreState {
    ClubName: string;
    setClubName: (value: string) => void;
    updateClubName: (value: string) => void;
}

const useClubNameStore = create<ClubNameStoreState>((set) => ({
    ClubName: '', // Initial state
    setClubName: (value: string) => set({ ClubName: value }),
    updateClubName: (value: string) => set((state) => ({
        ClubName: state.ClubName ? state.ClubName : value // Only update if not already set
    })),
}));

export default useClubNameStore