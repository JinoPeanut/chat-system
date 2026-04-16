
export type AttendanceType = {
    id: string,
    userId: string,
    date: string,
    checkInAt: number | null,
    checkOutAt: number | null,
    workMinutes: number | null,
}

export const ATTENDANCE: AttendanceType[] = [];
