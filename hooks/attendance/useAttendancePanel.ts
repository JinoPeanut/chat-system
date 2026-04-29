import { AttendanceType } from "@/types/attendance";
import { useEffect, useState } from "react";

export default function useAttendancePanel() {

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

    const [now, setNow] = useState<Date | null>(null);
    const [attendance, setAttendance] = useState<AttendanceType[]>([]);

    const todayKey = new Date().toISOString().slice(0, 10);
    const myUserId = "user-1";

    const fetchAttendance = async () => {
        const res = await fetch("/api/attendance");
        const data: AttendanceType[] = await res.json();
        setAttendance(data);
    };

    // 내 기록인지, 오늘날짜가 맞는지 확인
    const todayAttendance = attendance.find(
        (r) => r.userId === myUserId && r.date === todayKey
    );
    const checkInText = formatTimeFromMinutes(todayAttendance?.checkInAt ?? null);
    const checkOutText = formatTimeFromMinutes(todayAttendance?.checkOutAt ?? null);

    const workTime = 2400;
    const workMinutesText = todayAttendance?.workMinutes ?? 0;
    const leftMinutes = workTime - workMinutesText;

    const workPercent = Math.min(100, (workMinutesText / workTime) * 100);

    const handleCheckIn = async () => {
        if (todayAttendance?.checkInAt) return;

        const now = new Date();
        const checkInAt = now.getHours() * 60 + now.getMinutes();

        const res = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                userId: myUserId,
                date: todayKey,
                checkInAt,
                checkOutAt: null,
                workMinutes: null
            })
        });

        if (!res.ok) return;

        await fetchAttendance();
    }

    const handleCheckOut = async () => {
        if (!todayAttendance?.checkInAt) return;

        const now = new Date();
        const checkOutAt = now.getHours() * 60 + now.getMinutes();
        const workMinutes = checkOutAt - todayAttendance.checkInAt;

        const res = await fetch("/api/attendance", {
            method: "PATCH",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                userId: myUserId,
                date: todayKey,
                checkOutAt,
                workMinutes,
            })
        });

        if (!res.ok) return;

        await fetchAttendance();
    }

    useEffect(() => {
        fetchAttendance();
    }, [])

    return {
        formatKoreanTime,
        formatMinutes,
        now,
        setNow,
        todayAttendance,
        checkInText,
        checkOutText,
        workMinutesText,
        leftMinutes,
        workPercent,
        handleCheckIn,
        handleCheckOut,
    }
}