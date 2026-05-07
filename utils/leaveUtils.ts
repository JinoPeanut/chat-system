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

// 입사 n년차 함수
export function fullYearsBetween(createdAt: string, now: Date) {
    const start = new Date(createdAt);

    let years = now.getFullYear() - start.getFullYear();

    const hasNotReachedAnniversary =
        now.getMonth() < start.getMonth() ||
        (now.getMonth() === start.getMonth() && now.getDate() < start.getDate());

    if (hasNotReachedAnniversary) {
        years -= 1;
    }

    return years;
}

// 입사 n개월차 함수
export function fullMonthsBetween(createdAt: string, now: Date) {
    const start = new Date(createdAt);

    let months =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth());

    if (now.getDate() < start.getDate()) {
        months -= 1;
    }

    return Math.max(months, 0);
}

// 총 연차 계산함수
export function calculateAnnualLeave(createdAt: string, now = new Date()) {
    const years = fullYearsBetween(createdAt, now);
    const months = fullMonthsBetween(createdAt, now);

    if (years < 1) {
        return Math.min(months, 11);
    }

    if (years === 1 || years === 2) {
        return 15;
    }

    return Math.min(15 + Math.floor((years - 1) / 2), 25);
}