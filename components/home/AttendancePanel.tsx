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

function formatMinutes(minutes: number) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}시간 ${m}분`
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

    const workTime = 2400;
    const workMinutesText = todayRecord?.workMinutes ?? 0;
    const leftMinutes = workTime - workMinutesText;

    const workPercent = Math.min(100, (workMinutesText / workTime) * 100);

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
                px-2 pb-4 shadow-lg min-h-[50%] mb-4
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

            <div className="flex mt-8 gap-2">
                <p className="text-sm font-bold">이번주 근무시간</p>
                <p className="text-sm text-green-400 font-bold">{formatMinutes(workMinutesText)}</p>
            </div>

            <p className="text-xs text-gray-400">
                {formatMinutes(leftMinutes)}의 근무시간이 필요합니다
            </p>

            {/* 남은 근무시간 그래프 */}
            <div className="flex flex-col gap-1 mt-4">
                <div className="bg-gray-300 rounded-full h-2">
                    <div
                        className="bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${workPercent}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                    <span>0시간</span>
                    <span>20시간</span>
                    <span>40시간</span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4">
                <button
                    className="border border-black px-6 py-2 rounded-md
                    hover:bg-green-500 hover:text-white hover:border-white
                    cursor-pointer disabled:text-gray-400 disabled:bg-gray-300
                    disabled:border-gray-300"
                    onClick={handleCheckIn}
                    disabled={!!todayRecord?.checkInAt}
                >
                    출근하기
                </button>
                <button
                    className="border border-black px-6 py-2 rounded-md
                    hover:bg-red-500 hover:text-white hover:border-white
                    cursor-pointer disabled:text-gray-400 disabled:bg-gray-300
                    disabled:border-gray-300"
                    onClick={handleCheckOut}
                    disabled={!todayRecord?.checkInAt || !!todayRecord?.checkOutAt}
                >
                    퇴근하기
                </button>
            </div>
        </div>
    )
}