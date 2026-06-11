export type LeaveType = "annual" | "half_am" | "half_pm";
export type LeaveStatus = "pending" | "approved" | "rejected";

export type ApplyForm = {
    leaveDate: string,
    leaveType: LeaveType, // "annual" | "half_am" | "half_pm"
    reason: string,
}

// 남은 연차 보여주기
export type LeaveBalance = {
    totalDays: number,
    usedDays: number,
    useHours: number,
    remainDays: number,
    remainHours: number;
    leavePercent: number;
}

// 연차 사용시점에 대한 자세한 정보
export type LeaveHistory = {
    id: string,
    leaveDate: string,
    usedDays: number,
    usedHours: number,
    leaveType: LeaveType,
    reason?: string,
    status: LeaveStatus,
    createdAt: string,
}

export type AdminLeave = {
    id: string,
    userId: string,
    createdAt: string,
    leaveDate: string,
    leaveType: LeaveType,
    usedDays: number,
    usedHours: number,
    status: LeaveStatus,
    reason: string | null,
    user: {
        name: string,
        department: string,
        position: string,
        profilePic: string | null,
    }
}