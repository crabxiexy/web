// types.ts
export interface Score {
    run: number;
    groupex: number;
    activity: number;
    total: number;
}

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

export interface ClubApplication {
    name: string;
    leader: Student;
    intro: string;
    department: string;
    is_checked: number;
    result: number;
    response: string;
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
    startTime: string; // Using string to represent OffsetDateTime
    finishTime: string; // Using string to represent OffsetDateTime
    organizor: Student;
    lowLimit: number;
    upLimit: number;
    num: number;
    members: Student[];
}