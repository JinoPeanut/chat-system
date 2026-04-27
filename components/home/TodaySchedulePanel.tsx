"use client"

import { ScheduleDetail, ScheduleHome } from "@/types/schedule";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
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

const formatDateTimeLocal = (dateString: string) => {
    const d = new Date(dateString)
    const offset = d.getTimezoneOffset() * 60000
    const localTime = new Date(d.getTime() - offset)
    return localTime.toISOString().slice(0, 16)
}

export default function TodaySchedulePanel() {
    const myUserId = "user-1";

    const [scheduleHome, setScheduleHome] = useState<ScheduleHome[]>([]);
    const [scheduleDetail, setScheduleDetail] = useState<ScheduleDetail[]>([]);

    const [isOpen, setIsOpen] = useState(false);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const [currentYear, setCurrentYear] = useState(year);
    const [currentMonth, setCurrentMonth] = useState(month);
    const [selectedDay, setSelectedDay] = useState<{ year: number, month: number, day: number } | null>(null);
    const [mode, setMode] = useState<"list" | "add" | "edit">("list");
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDetail | null>(null);
    const [form, setForm] = useState({
        title: "",
        titleMemo: "",
        content: "",
        startAt: "",
        endAt: "",
    })

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

    // 홈화면에만 표시할것들
    const myScheduleHome = scheduleHome
        .filter((u) => u.userId === myUserId)
        .filter((u) => new Date(u.startAt).toDateString() === now.toDateString())
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
        .slice(0, 3);

    // 상세화면 안에 년도,월,일 이 정확하게 맞는것만 표시할것들
    const selectedDaySchedules = scheduleDetail
        .filter((s) => {
            if (!selectedDay) return false;

            const d = new Date(s.startAt);

            return (
                s.userId === myUserId &&
                d.getFullYear() === selectedDay.year &&
                d.getMonth() === selectedDay.month &&
                d.getDate() === selectedDay.day
            )
        })
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

    const totalSchedule = scheduleHome
        .filter((u) => u.userId === myUserId)
        .filter((u) => new Date(u.startAt).toDateString() === now.toDateString())
        .length;

    const handleAdd = async () => {
        if (!form.title || !form.startAt) return;

        const res = await fetch("/api/schedule", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                userId: myUserId,
                title: form.title,
                titleMemo: form.titleMemo,
                content: form.content,
                startAt: form.startAt,
                endAt: form.endAt,
            })
        });

        if (!res.ok) return;

        await fetchScheduleData();

        setForm({
            title: "",
            titleMemo: "",
            content: "",
            startAt: "",
            endAt: "",
        })

        setMode("list");
    }

    const handleEdit = async () => {
        if (!form.title || !form.startAt || !selectedSchedule?.id) return;

        const res = await fetch("/api/schedule", {
            method: "PATCH",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                id: selectedSchedule?.id,
                userId: myUserId,
                title: form.title,
                titleMemo: form.titleMemo,
                content: form.content,
                startAt: form.startAt,
                endAt: form.endAt,
            })
        });

        if (!res.ok) return;

        await fetchScheduleData();

        setMode("list");
    }

    const handleDelete = async () => {
        if (!selectedSchedule?.id) return;

        const res = await fetch("/api/schedule", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedSchedule?.id,
                userId: myUserId,
            }),
        });

        if (!res.ok) return;

        await fetchScheduleData();

        setMode("list");
    }

    useEffect(() => {
        fetchScheduleData();
    }, [])

    useEffect(() => {
        if (mode === "edit" && selectedSchedule) {
            setForm({
                title: selectedSchedule.title ?? "",
                titleMemo: selectedSchedule.titleMemo ?? "",
                content: selectedSchedule.content ?? "",
                startAt: formatDateTimeLocal(selectedSchedule.startAt),
                endAt: selectedSchedule.endAt
                    ? formatDateTimeLocal(selectedSchedule.endAt)
                    : "",
            })
        }

        if (mode === "add") {
            setForm({
                title: "",
                titleMemo: "",
                content: "",
                startAt: "",
                endAt: "",
            })
        }
    }, [mode, selectedSchedule])

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
                <div key={schedule.id} className={`${scheduleColors[index % scheduleColors.length]} rounded-md m-2 p-2 flex gap-3`}>
                    <div className={`${barColors[index % barColors.length]} w-[0.2rem] h-[2.5rem]`}>{/* 세로줄 */}</div>
                    <div className="flex flex-col justify-between">
                        <div className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                            {schedule.title}
                            {schedule.titleMemo && (<p className="w-[3px] h-[3px] rounded-full bg-black"></p>)}
                            {schedule.titleMemo}
                        </div>
                        <div className="flex gap-1 text-xs font-semibold text-gray-400 group-hover:text-gray-100">
                            {new Date(schedule.startAt).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            })}
                            <p>-</p>
                            {schedule.endAt ? new Date(schedule.endAt).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            }) : "-"}
                        </div>
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
                        className="bg-white p-4 rounded-md flex gap-4 h-[72vh]"
                    >
                        <div className="w-[24rem] flex flex-col">
                            {/* 년/월 + 이동버튼 */}
                            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                <button
                                    onClick={() => {
                                        if (currentMonth === 0) {
                                            setCurrentMonth(11)
                                            setCurrentYear(currentYear - 1)
                                        } else {
                                            setCurrentMonth(currentMonth - 1)
                                        }
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                                >
                                    <ChevronLeft size={22} />
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
                                    className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                                >
                                    <ChevronRight size={22} />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 content-start flex-1">
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
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 날짜 선택시 상세 페이지 */}
                        <div className={`
                            overflow-hidden transition-all duration-300 flex flex-col
                            ${selectedDay ? "w-[300px] opacity-100" : "w-0 opacity-0"}
                        `}
                            style={{ height: "100%" }}
                        >
                            {/* 헤더 */}
                            <div className="flex justify-start gap-2 flex-shrink-0 border-b border-gray-100 pb-2 pl-2">
                                {mode === "list"
                                    ? (
                                        <>
                                            <p className="font-bold text-sm">{(selectedDay?.month ?? 0) + 1}월 {selectedDay?.day}일 일정</p>
                                            <div className="flex items-end">
                                                <p className="font-bold text-xs text-gray-500">총 {selectedDaySchedules.length}개</p>
                                            </div>
                                        </>
                                    )
                                    : (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setMode("list")
                                                    setSelectedSchedule(null)
                                                }}
                                                className="p-1 text-gray-400 hover:bg-gray-100 hover:text-black rounded cursor-pointer"
                                            >
                                                <ChevronLeft size={22} />
                                            </button>
                                            <p className="font-bold text-sm">
                                                {mode === "add" ? "일정 추가" : "일정 수정"}
                                            </p>
                                        </div>
                                    )}
                            </div>

                            {/* 일정목록 폼 */}
                            {mode === "list" && (
                                <>
                                    <div className="overflow-y-auto flex-1 pt-2">
                                        {selectedDaySchedules.map((schedule, index) => {
                                            return (
                                                <div
                                                    key={schedule.id}
                                                    onDoubleClick={() => {
                                                        setSelectedSchedule(schedule)
                                                        setMode("edit")
                                                    }}
                                                    className={`${scheduleColors[index % scheduleColors.length]} rounded-md m-2 p-2 flex gap-3 cursor-pointer`}>
                                                    <div className={`${barColors[index % barColors.length]} w-[0.2rem] h-[3.7rem]`}></div>
                                                    <div className="flex flex-col justify-between">
                                                        <div className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                                                            {schedule.title}
                                                            {schedule.titleMemo && (<p className="w-[3px] h-[3px] rounded-full bg-black"></p>)}
                                                            {schedule.titleMemo}
                                                        </div>
                                                        <div className="text-sm font-semibold flex items-center gap-1">
                                                            {schedule.content ?? "-"}
                                                        </div>
                                                        <div className="flex gap-1 text-xs font-semibold text-gray-400 group-hover:text-gray-100">
                                                            {new Date(schedule.startAt).toLocaleTimeString("ko-KR", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: false,
                                                            })}
                                                            <p>-</p>
                                                            {schedule.endAt ? new Date(schedule.endAt).toLocaleTimeString("ko-KR", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: false,
                                                            }) : "-"}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* 일정 추가 버튼 - 항상 하단 고정 */}
                                    <div className="flex-shrink-0 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => setMode("add")}
                                            className="w-full py-2 rounded-lg border border-violet-300 text-violet-500 hover:bg-violet-50 text-sm">
                                            + 일정 추가
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* 추가/수정 폼 */}
                            {(mode === "add" || mode === "edit") && (
                                <div className="flex flex-col gap-3 p-4 flex-1">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">제목</label>
                                        <input
                                            value={form.title}
                                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                                            placeholder="일정 제목"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">메모</label>
                                        <input
                                            value={form.titleMemo}
                                            onChange={(e) => setForm((prev) => ({ ...prev, titleMemo: e.target.value }))}
                                            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                                            placeholder="간단한 메모"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">내용</label>
                                        <textarea
                                            value={form.content}
                                            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                                            className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none"
                                            placeholder="상세 내용"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-1 flex-1">
                                            <label className="text-xs text-gray-500">시작 시간</label>
                                            <input
                                                type="datetime-local"
                                                value={form.startAt}
                                                onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
                                                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 flex-1">
                                            <label className="text-xs text-gray-500">종료 시간</label>
                                            <input
                                                type="datetime-local"
                                                value={form.endAt}
                                                onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
                                                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        {mode === "edit" && (
                                            <button
                                                onClick={handleDelete}
                                                className="flex-1 py-2 rounded-lg border border-red-300 text-red-400 hover:bg-red-50 text-sm cursor-pointer">
                                                삭제
                                            </button>
                                        )}
                                        <button
                                            onClick={mode === "add" ? handleAdd : handleEdit}
                                            className="flex-1 py-2 rounded-lg bg-violet-500 text-white hover:bg-violet-600 text-sm cursor-pointer">
                                            {mode === "add" ? "추가" : "수정"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>)
            }
        </div>

    )
}
