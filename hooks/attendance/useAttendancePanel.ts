import { HomeAttendance } from "@/types/attendance";
import { RefreshOptions } from "@/types/home";
import { useState } from "react";

type useAttendancePanelProps = {
    attendance: HomeAttendance,
    onRefresh: (options?: RefreshOptions) => Promise<void>,
}

export default function useAttendancePanel({ attendance, onRefresh }: useAttendancePanelProps) {

    // 현재 시간 표시용
    function formatKoreanTime(now: Date) {
        const parts = new Intl.DateTimeFormat("ko-KR", {
            timeZone: "Asia/Seoul",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).formatToParts(now);

        const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
        return `${map.year}년 ${map.month}월 ${map.day}일 (${map.weekday}) ${map.hour}:${map.minute}`;
    }

    function formatMinutes(minutes: number) {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return `${h}시간 ${m}분`
    }

    function formatTimeFromMinutes(minutes: number | null) {
        if (minutes === null) return "-";

        const h = String(Math.floor(minutes / 60)).padStart(2, "0");
        const m = String(minutes % 60).padStart(2, "0");

        return `${h}:${m}`;
    }

    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    const todayAttendance = attendance?.today;
    const workMinutes = attendance.workMinutes
    const leftMinutes = attendance.leftMinutes
    const workPercent = attendance.workPercent

    const checkInText = formatTimeFromMinutes(todayAttendance?.checkInAt ?? null);
    const checkOutText = formatTimeFromMinutes(todayAttendance?.checkOutAt ?? null);

    const handleCheckIn = async () => {
        if (todayAttendance?.checkInAt) return;

        const res = await fetch("/api/attendance", {
            method: "POST",
        });

        if (!res.ok) return;

        await onRefresh({ silent: true });
    }

    const handleCheckOut = async () => {
        if (!todayAttendance?.checkInAt) return;

        const res = await fetch("/api/attendance", {
            method: "PATCH",
        });

        if (!res.ok) return;

        await onRefresh({ silent: true });
    }

    return {
        formatKoreanTime,
        formatMinutes,
        currentTime,
        setCurrentTime,
        todayAttendance,
        workMinutes,
        leftMinutes,
        workPercent,
        checkInText,
        checkOutText,
        handleCheckIn,
        handleCheckOut,
    }
}