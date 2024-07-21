// types.tsx
export interface Student {
    studentID: number;
    name: string;
    profile: string;
    taID: number;
    score: Score;
    department: string;
    className: string;
}

export interface Club {
    club_id: number;
    name: string;
    leader: Student;
    intro: string;
    department: string;
    profile: string;
    members: Student[];
}

export interface Score {
    run: number;
    groupex: number;
    activity: number;
    total: number;
}
