import { LeaveType } from "@/types/leave"

export const getLeaveColor = (percent: number) => {
    if (percent <= 10) return "bg-green-500"
    if (percent <= 20) return "bg-green-400"
    if (percent <= 30) return "bg-green-300"
    if (percent <= 40) return "bg-lime-300"
    if (percent <= 50) return "bg-yellow-300"
    if (percent <= 60) return "bg-yellow-400"
    if (percent <= 70) return "bg-orange-300"
    if (percent <= 80) return "bg-orange-400"
    if (percent <= 90) return "bg-orange-500"
    return "bg-red-500"
}

export function getUsageByLeaveType(leaveType: LeaveType) {
    if (leaveType === "annual") {
        return { usedDays: 1, usedHours: 8 };
    }
    return { usedDays: 0.5, usedHours: 4 };
}