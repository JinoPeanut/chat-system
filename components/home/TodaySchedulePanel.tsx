"use client"

import { ScheduleDetail, ScheduleHome } from "@/types/schedule";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

const scheduleColors = [
    "bg-violet-200 hover:bg-violet-300",
    "bg-blue-100 hover:bg-blue-200",
    "bg-green-100 hover:bg-green-200",
    "bg-yellow-100 hover:bg-yellow-200",
]

const barColors = [
    "bg-violet-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
]

export default function TodaySchedulePanel() {
    const myUserId = "user-1";
    const myUserName = "홍길동";

    const [scheduleHome, setScheduleHome] = useState<ScheduleHome[]>([]);
    const [scheduleDetail, setScheduleDetail] = useState<ScheduleDetail[]>([]);

    const [isOpen, setIsOpen] = useState(false);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const [currentYear, setCurrentYear] = useState(year);
    const [currentMonth, setCurrentMonth] = useState(month);
    const [selectedDay, setSelectedDay] = useState<{ year: number, month: number, day: number } | null>(null);

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = now.getDate();

    const days = [
        ...Array(firstDay).fill(null),  // 1일 전 빈칸
        ...Array(lastDate).fill(0).map((_, i) => i + 1)  // 1~말일
    ]

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const fetchScheduleData = async () => {
        const res = await fetch("/api/schedule");
        const data = await res.json();
        setScheduleHome(data);
        setScheduleDetail(data);
    }

    const myScheduleHome = scheduleHome
        .filter((u) => u.userId === myUserId)
        .slice(0, 3);

    const totalSchedule = scheduleHome.filter((u) => u.userId === myUserId).length;

    useEffect(() => {
        fetchScheduleData();
    }, [])

    return (
        <div className="border border-gray-300 rounded-xl
                shadow-lg min-h-[45%] pb-2 overflow-hidden mt-2
            ">
            {/* 일정 추가 */}
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
                <p className="font-bold text-sm">
                    오늘의 일정
                </p>
                <div
                    className="bg-violet-200 rounded-lg p-1 cursor-pointer hover:bg-violet-300"
                    onClick={openModal}
                >
                    <Plus size={18} />
                </div>
            </div>

            <div className="border-gray-100 border-[0.2]"></div>

            {/* 일정 카드 - Object로 여러개 배치하기*/}
            {myScheduleHome.map((schedule, index) => (
                <div key={schedule.id} className={`${scheduleColors[index % scheduleColors.length]} rounded-md m-2 p-2 flex gap-3 hover:bg-violet-300 group`}>
                    <div className={`${barColors[index & barColors.length]} w-[0.2rem] h-[2.5rem]`}>{/* 세로줄 */}</div>
                    <div className="flex flex-col justify-between">
                        <div className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                            {schedule.title}
                            {schedule.titleMemo && (<p className="w-[3px] h-[3px] rounded-full bg-black"></p>)}
                            {schedule.titleMemo}
                        </div>
                        <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-100">
                            {new Date(schedule.startAt).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            })}
                        </p>
                    </div>
                </div>
            ))}

            {/* 3개 이상 스케줄 표시방법 */}
            {totalSchedule > 3 && (
                <div
                    onClick={openModal}
                    className="text-xs text-gray-400 text-center cursor-pointer hover:text-violet-400 pb-2"
                >
                    + {totalSchedule - 3}개 더보기
                </div>
            )}

            {/* 스케줄 모달 */}
            {isOpen &&
                (<div onClick={closeModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-4 rounded-md flex gap-4"
                    >
                        <div className="w-[24rem]">
                            {/* 년/월 + 이동버튼 */}
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    onClick={() => {
                                        if (currentMonth === 0) {
                                            setCurrentMonth(11)
                                            setCurrentYear(currentYear - 1)
                                        } else {
                                            setCurrentMonth(currentMonth - 1)
                                        }
                                    }}
                                    className="px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                                >
                                    {"<"}
                                </button>

                                <p className="text-sm font-bold">{currentYear}년 {currentMonth + 1}월</p>

                                <button
                                    onClick={() => {
                                        if (currentMonth === 11) {
                                            setCurrentMonth(0)
                                            setCurrentYear(currentYear + 1)
                                        } else {
                                            setCurrentMonth(currentMonth + 1)
                                        }
                                    }}
                                    className="px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                                >
                                    {">"}
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 min-h-[28rem] content-start">
                                {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                                    <div key={d} className="text-center text-xs text-gray-400">{d}</div>
                                ))}
                                {days.map((day, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedDay({ year: currentYear, month: currentMonth, day: day })}
                                        className={`flex flex-col items-center text-sm rounded-md w-[3rem] h-[4rem]
                                        ${day === today && currentMonth === month && currentYear === year
                                                ? "bg-purple-500 text-white hover:bg-purple-300"
                                                : ""}
                                        ${day === null ? "" : "cursor-pointer hover:bg-gray-100"}
                                        ${selectedDay?.year === currentYear && selectedDay.month === currentMonth && selectedDay.day === day
                                                ? "border border-purple-500"
                                                : ""}
                                    `}
                                    >
                                        {day === null ? "" : day}
                                        <div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 날짜 선택시 상세 페이지 */}
                        <div className={`
                            overflow-hidden transition-all duration-300
                            ${selectedDay ? "w-[300px] opacity-100" : "w-0 opacity-0"}
                        `}>
                            <p className="font-bold text-sm">{selectedDay?.day}일 일정</p>
                        </div>
                    </div>
                </div>)
            }
        </div>

    )
}
