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

export interface StudentApplication {
    student: Student;
    clubName: string;
    isChecked: number;
    result: number;
}

export interface Activity {
    activityID: number;
    club: Club;
    activityName: string;
    intro: string;
    startTime: string; // 使用 ISO 字符串格式
    finishTime: string; // 使用 ISO 字符串格式
    organizor: Student;
    lowLimit: number;
    upLimit: number;
    num: number;
    members: Student[];
}