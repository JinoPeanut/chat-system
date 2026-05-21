"use client";

import { User } from "@/types/chat";
import { Building2Icon, Calendar, FileText, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";

type AdminSummary = {
    userTotal: number,
    onlineUserTotal: number,
    departmentTotal: number,
    pendingLeaveTotal: number,
    pendingLeaveDiff: number,
    monthlyNoticeTotal: number,
    monthlyNoticeDiff: number,
}

const formatDiff = (diff: number, unit: string) => {
    if (diff > 0) return `▲ ${diff}${unit}`;
    if (diff < 0) return `▼ ${Math.abs(diff)}${unit}`;
    return `- 0${unit}`;
}

const getDiffColor = (diff: number) => {
    if (diff > 0) return "text-green-400";
    if (diff < 0) return "text-red-400";
    return "text-gray-400";
}

export default function AdminDashboard() {
    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    const fetchSummaryData = async () => {
        const res = await fetch("/api/admin/summary");
        const data = await res.json();

        if (!res.ok) return;

        setSummary(data);
    }

    useEffect(() => {
        fetchSummaryData();
    }, [])

    return (
        <div className="min-h-0 flex flex-col justify-center gap-5 px-8 py-6">
            {/* 최상단 - 메세지, 시간표시 등 */}
            <div className="flex justify-between">
                <div className="flex flex-col gap-2">
                    <h2 className="font-semibold text-lg">관리자님, 오늘도 좋은 하루 되세요!</h2>
                    <p className="text-gray-500 text-sm">시스템 현황을 한눈에 확인하세요.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <div>알림</div>
                    <p></p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-5 mt-5">
                {/* 전체 사원 수 */}
                <div className="flex gap-4 rounded-md shadow-sm px-6 py-8 bg-white/80">
                    <div className="flex items-center justify-center rounded-lg bg-violet-200 text-violet-500 p-4">
                        <UsersRound size={30} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-gray-500 text-xs font-semibold">전체 사원 수</p>
                        <div className="flex items-end">
                            <p className="text-2xl font-bold">{summary?.userTotal}</p>
                            <span className="font-bold">명</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
                            <p>현재 온라인 유저</p>
                            <span className={`${getDiffColor(summary?.onlineUserTotal ?? 0)}`}>
                                {formatDiff(summary?.onlineUserTotal ?? 0, "명")}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 rounded-md shadow-sm px-6 py-8 bg-white/80">
                    <div className="flex items-center justify-center rounded-lg bg-blue-200 text-blue-500 p-4">
                        <Building2Icon size={30} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-gray-500 text-sm font-semibold">부서 수</p>
                        <div className="flex items-end">
                            <p className="text-2xl font-bold">{summary?.departmentTotal}</p>
                            <span className="font-bold">개</span>
                        </div>
                        <p className="text-gray-500 text-xs font-semibold">현재 등록된 부서</p>
                    </div>
                </div>

                <div className="flex gap-4 rounded-md shadow-sm px-6 py-8 bg-white/80">
                    <div className="flex items-center justify-center rounded-lg bg-orange-200 text-orange-500 p-4">
                        <Calendar size={30} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-gray-500 text-sm font-semibold">대기 중 연차 신청 수</p>
                        <div className="flex items-end">
                            <p className="text-2xl font-bold">{summary?.pendingLeaveTotal}</p>
                            <span className="font-bold">건</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
                            <p>전월 대비</p>
                            <span className={`${getDiffColor(summary?.pendingLeaveDiff ?? 0)}`}>
                                {formatDiff(summary?.pendingLeaveDiff ?? 0, "건")}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 rounded-md shadow-sm px-6 py-8 bg-white/80">
                    <div className="flex items-center justify-center rounded-lg bg-green-200 text-green-500 p-4">
                        <FileText size={30} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-gray-500 text-sm font-semibold">이번 달 게시글 수</p>
                        <div className="flex items-end">
                            <p className="text-2xl font-bold">{summary?.monthlyNoticeTotal}</p>
                            <span className="font-bold">건</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
                            <p>전월 대비</p>
                            <span className={`${getDiffColor(summary?.monthlyNoticeDiff ?? 0)}`}>
                                {formatDiff(summary?.monthlyNoticeDiff ?? 0, "건")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}