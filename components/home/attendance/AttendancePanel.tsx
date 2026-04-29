"use client"

import { useEffect } from "react";
import { ArrowDown } from "lucide-react";
import useAttendancePanel from "@/hooks/attendance/useAttendancePanel";

export default function AttendancePanel() {
    const {
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
    } = useAttendancePanel();

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
                    {now ? formatKoreanTime(now) : ""}
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
                    disabled={!!todayAttendance?.checkInAt}
                >
                    출근하기
                </button>
                <button
                    className="border border-black px-6 py-2 rounded-md
                    hover:bg-red-500 hover:text-white hover:border-white
                    cursor-pointer disabled:text-gray-400 disabled:bg-gray-300
                    disabled:border-gray-300"
                    onClick={handleCheckOut}
                    disabled={!todayAttendance?.checkInAt || !!todayAttendance?.checkOutAt}
                >
                    퇴근하기
                </button>
            </div>
        </div>
    )
}