"use client"

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { ATTENDANCE } from "@/types/attendance";
import { USERS } from "@/types/chat";

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

export default function AttendancePanel() {
    const [now, setNow] = useState(new Date());
    const [attendance, setAttendance] = useState(ATTENDANCE);

    const todayKey = new Date().toISOString().slice(0, 10);
    const myUserId = USERS.user1.id;

    // 내 기록인지, 오늘날짜가 맞는지 확인
    const todayRecord = attendance.find(
        (r) => r.userId === myUserId && r.date === todayKey
    );
    const checkInText = todayRecord?.checkInAt
        ? new Date(todayRecord.checkInAt).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        : "-";
    const checkOutText = todayRecord?.checkOutAt
        ? new Date(todayRecord.checkOutAt).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        : "-";

    function handleCheckIn() {
        if (todayRecord?.checkInAt) return;

        setAttendance((prev) => {
            const record = prev.find((r) => r.userId === myUserId && r.date === todayKey);

            if (!record) {
                return [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        userId: myUserId,
                        date: todayKey,
                        checkInAt: Date.now(),
                        checkOutAt: null,
                        workMinutes: null,
                    }
                ]
            }

            return prev.map((r) => r.userId === myUserId && r.date === todayKey
                ? { ...r, checkInAt: Date.now() }
                : r
            )
        })
    }

    function handleCheckOut() {
        if (!todayRecord?.checkInAt || todayRecord.checkOutAt) return;

        const checkOutAt = Date.now();

        setAttendance((prev) =>
            prev.map((r) => {
                if (r.userId !== myUserId || r.date !== todayKey) return r;

                const workMinutes = Math.floor((checkOutAt - (r.checkInAt ?? checkOutAt)) / 60000);

                return {
                    ...r,
                    checkOutAt,
                    workMinutes,
                }
            }))
    }

    // 1분마다 시간 업데이트
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(timer);
    }, [])

    return (
        <div
            className="
                border border-gray-200 rounded-md
                px-2 shadow-lg min-h-screen
            ">
            <div className="pb-4">
                <h2 className="text-sm font-bold pt-3">
                    근태 관리
                </h2>
                <p className="pt-1 text-xs text-gray-400">
                    {formatKoreanTime(now)}
                </p>
            </div>

            {/* 출퇴근 시간표시 */}
            <div className="rounded-md bg-gray-300/70 flex flex-col items-center py-2">
                <div className="flex gap-3">
                    <p>출근 시간</p>
                    <p>{checkInText}</p>
                </div>
                <div className="py-2">
                    <ArrowDown size={16} />
                </div>
                <div className="flex gap-3">
                    <p>퇴근 시간</p>
                    <p>{checkOutText}</p>
                </div>
            </div>

            <span>이번주 근무시간</span>
            <span>{"00시간 00분"}</span>
            <p>남은 근무시간 {"00시간 00분"}</p>

            <button onClick={handleCheckIn}>
                출근하기
            </button>
            <button onClick={handleCheckOut}>
                퇴근하기
            </button>

        </div>
    )
}