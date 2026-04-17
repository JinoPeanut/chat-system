export type LeaveType = "annual" | "half-am" | "half-pm";
export type LeaveStatus = "pending" | "approved" | "rejected";

export type Leave = {
    userId: string,
    totalDays: number,
    usedDays: number,
    useHours: number,
}

export type LeaveHistory = {
    id: string,
    userId: string,
    leaveDate: string,
    usedDays: number,
    usedHours: number,
    leaveType: LeaveType,
    reason?: string,
    status: LeaveStatus,
    createdAt: string,
}

export const LEAVE: Record<string, Leave> = {
    leave1: {
        userId: "user-1",
        totalDays: 15,
        usedDays: 2,
        useHours: 0,
    }
}

export const LEAVE_HISTORY: LeaveHistory[] = [
    {
        id: "lh-1",
        userId: "user-1",
        leaveDate: "2026-01-15",
        usedDays: 1,
        usedHours: 8,
        leaveType: "annual",
        status: "approved",
        reason: "개인 사유",
        createdAt: "2026-01-05T09:10:00.000Z",
    },
    {
        id: "lh-2",
        userId: "user-1",
        leaveDate: "2026-03-21",
        usedDays: 0.5,
        usedHours: 4,
        leaveType: "half-pm",
        status: "approved",
        createdAt: "2026-03-10T02:20:00.000Z",
    },
];