export type LeaveType = "annual" | "half_am" | "half_pm";
export type LeaveStatus = "pending" | "approved" | "rejected";

export type ApplyForm = {
    leaveDate: string,
    leaveType: LeaveType, // "annual" | "half_am" | "half_pm"
    reason: string,
}

// 남은 연차 보여주기
export type LeaveBalance = {
    userId: string,
    totalDays: number,
    usedDays: number,
    useHours: number,
}

// 연차 사용시점에 대한 자세한 정보
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

export type LeaveResponse = {
    leaveBalance: LeaveBalance[],
    leaveHistory: LeaveHistory[],
}