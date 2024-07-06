import create from 'zustand';

interface StudentIdStoreState {
    studentId: string;
    setStudentId: (value: string) => void;
    updateStudentId: (value: string) => void;
}

const useStudentIdStore = create<StudentIdStoreState>((set) => ({
    studentId: '', // Initial state
    setStudentId: (value: string) => set({ studentId: value }),
    updateStudentId: (value: string) => set((state) => ({
        studentId: state.studentId ? state.studentId : value // Only update if not already set
    })),
}));

export default useStudentIdStore;