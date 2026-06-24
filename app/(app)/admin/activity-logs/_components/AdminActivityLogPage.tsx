"use client"

import ProfileAvatar from "@/components/common/ProfileAvatar";
import { usePagination } from "@/hooks/notice/usePagination";
import { AdminActivityLog, AdminActivityLogResponse } from "@/types/logs";
import { getActivityIcon, getActivityName, getActivityStyle } from "@/utils/logUtils";
import { CalendarDaysIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AdminActivityLogPage() {
    const LIMIT = 10;

    const [logs, setLogs] = useState<AdminActivityLog[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    const [totalPages, setTotalPages] = useState(1);
    const { page, setPage, nextPage, prevPage } = usePagination({ totalPages });

    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");

    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    const showErrorMessage = (message: string) => {
        setErrorMessage(message);

        setTimeout(() => {
            setErrorMessage("");
        }, 1500);
    }

    const fetchLogsData = async (signal: AbortSignal) => {

        const params = new URLSearchParams({
            page: String(page),
            limit: String(LIMIT),
        });

        if (periodStart) {
            params.set("periodStart", periodStart);
        }

        if (periodEnd) {
            params.set("periodEnd", periodEnd);
        }

        try {
            const res = await fetch(`/api/admin/activity-logs?${params.toString()}`, { signal });
            const data: AdminActivityLogResponse = await res.json();

            if (!res.ok) {
                showErrorMessage(data.message ?? "불러올 수 없는 로그 입니다.");
                return;
            }

            setLogs(data.logs);
            setTotalPages(data.totalPages);

        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") return;
            showErrorMessage("서버에 연결할 수 없습니다.")
        }
    }

    useEffect(() => {
        const controller = new AbortController();

        fetchLogsData(controller.signal);

        return () => {
            controller.abort();
        }
    }, [page, periodStart, periodEnd])

    return (
        <div className="relative h-[100dvh] w-full flex flex-col px-8 py-6">
            <div className="flex flex-col gap-2">
                <h2 className="font-bold text-lg">전체 활동 로그</h2>
                <p className="font-semibold text-sm text-gray-500">관리자의 주요 활동 내역을 확인할 수 있습니다.</p>
            </div>

            {errorMessage && (
                <div className="absolute right-5 top-15 animate-slide-toast bg-red-100 rounded-md px-4 py-2">
                    <p className="text-sm text-red-500">{errorMessage}</p>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-red-100">
                        <div className="h-full bg-red-500 animate-toast-timer" />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 mt-5">
                {/* 날짜 선택 */}
                <div className="flex items-center gap-2 rounded-lg px-4 py-2 border border-gray-300 bg-white">

                    <button
                        type="button"
                        onClick={() => startDateRef.current?.showPicker()}
                        className="text-sm text-gray-600 w-22"
                    >
                        {periodStart || "시작일"}
                    </button>

                    <span className="text-gray-400">~</span>

                    <button
                        type="button"
                        onClick={() => endDateRef.current?.showPicker()}
                        className="text-sm text-gray-600 w-22"
                    >
                        {periodEnd || "종료일"}
                    </button>

                    <CalendarDaysIcon size={18} className="text-gray-600" />

                    <input
                        ref={startDateRef}
                        type="date"
                        value={periodStart}
                        onChange={(e) => {
                            const nextStart = e.target.value;

                            if (periodEnd && nextStart > periodEnd) {
                                showErrorMessage("시작일은 종료일보다 늦을 수 없습니다");
                                return;
                            }

                            setPeriodStart(nextStart);
                            setPage(1);
                        }}
                        className="date-input-clean w-[110px] sr-only outline-none text-sm text-gray-600"
                    />

                    <input
                        ref={endDateRef}
                        type="date"
                        value={periodEnd}
                        onChange={(e) => {
                            const nextEnd = e.target.value;

                            if (periodStart && nextEnd < periodStart) {
                                showErrorMessage("종료일은 시작일보다 빠를 수 없습니다");
                                return;
                            }
                            setPeriodEnd(nextEnd);
                            setPage(1);
                        }}
                        className="date-input-clean w-[110px] sr-only outline-none text-sm text-gray-600"
                    />
                </div>
            </div>

            {/* 로그 목록 */}
            <div className="grid grid-cols-[150px_1fr_240px_150px] mt-3
                            border-t border-l border-r border-gray-300 rounded-t-lg px-8 py-2">
                <p className="text-center">타입</p>
                <p>내용</p>
                <p className="text-start">기간</p>
                <p>작업자</p>
            </div>

            <div className="flex flex-col border border-gray-300 rounded-b-lg bg-white">
                {logs.map((log, index) => {
                    const isLast = index === logs.length - 1;
                    const Icon = getActivityIcon(log.type);
                    return (
                        <div key={log.id}>
                            <div className="grid grid-cols-[150px_1fr_240px_150px] items-center px-8 py-3">
                                <div className={`w-fit flex items-center justify-self-center gap-2 rounded-md p-1 ${getActivityStyle(log.type)}`}>
                                    <Icon size={18} />
                                    <p className="text-sm">{getActivityName(log.type)}</p>
                                </div>

                                <p className="text-gray-500 font-semibold">{log.message}</p>

                                <p className="text-gray-600 font-semibold text-sm">
                                    {new Date(log.createdAt).toLocaleString("ko-KR")}
                                </p>

                                <div className="flex items-center gap-3">
                                    <ProfileAvatar
                                        src={log.admin.profilePic}
                                        alt={`${log.admin.name} 프로필 사진`}
                                        size={18}
                                    />
                                    <p className="text-gray-500 font-semibold">{log.admin.name}</p>
                                </div>
                            </div>

                            {!isLast && <div className="w-full h-[1px] bg-gray-200" />}
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-center items-center gap-4 mt-4">
                <button
                    onClick={prevPage}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-40"
                >
                    이전
                </button>
                <span className="text-sm font-medium">
                    {page} / {totalPages}
                </span>
                <button
                    onClick={nextPage}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-40"
                >
                    다음
                </button>
            </div>

        </div>
    )
}