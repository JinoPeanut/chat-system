import { useAuthStore } from "@/stores/useAuthStore";
import { HomeAttendance } from "@/types/attendance";
import { useState } from "react";

type useAttendancePanelProps = {
    attendance: HomeAttendance,
    onRefresh: () => Promise<void>,
}

export default function useAttendancePanel({ attendance, onRefresh }: useAttendancePanelProps) {
    const authUser = useAuthStore((state) => state.user);

    function formatKoreanTime(now: Date) {
        const parts = new Intl.DateTimeFormat("ko-KR", {
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

    const todayKey = new Date().toISOString().slice(0, 10);
    const myUserId = authUser?.id;

    const todayAttendance = attendance?.today;
    const workMinutes = attendance.workMinutes
    const leftMinutes = attendance.leftMinutes
    const workPercent = attendance.workPercent

    const checkInText = formatTimeFromMinutes(todayAttendance?.checkInAt ?? null);
    const checkOutText = formatTimeFromMinutes(todayAttendance?.checkOutAt ?? null);

    const handleCheckIn = async () => {
        if (todayAttendance?.checkInAt || !myUserId) return;

        const now = new Date();
        const checkInAt = now.getHours() * 60 + now.getMinutes();

        const res = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                date: todayKey,
                checkInAt,
                checkOutAt: null,
                workMinutes: null
            })
        });

        if (!res.ok) return;

        await onRefresh();
    }

    const handleCheckOut = async () => {
        if (!todayAttendance?.checkInAt || !myUserId) return;

        const now = new Date();
        const checkOutAt = now.getHours() * 60 + now.getMinutes();
        const workMinutes = checkOutAt - todayAttendance.checkInAt;

        const res = await fetch("/api/attendance", {
            method: "PATCH",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                date: todayKey,
                checkOutAt,
                workMinutes,
            })
        });

        if (!res.ok) return;

        await onRefresh();
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