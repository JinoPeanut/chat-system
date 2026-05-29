
export type HomeAttendance = {
    today: {
        date: string,
        checkInAt: number | null,
        checkOutAt: number | null,
        workMinutes: number | null,
    } | null,
    workMinutes: number,
    leftMinutes: number,
    workPercent: number,
}
