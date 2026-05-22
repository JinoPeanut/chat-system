"use client";

import { User } from "@/types/chat";
import { Building2Icon, Calendar, ChevronDown, ChevronRight, FileText, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Sector,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

type LeaveChartData = {
    name: string,
    value: number,
}

type NoticeChartData = {
    label: string,
    count: number,
}

type AdminSummary = {
    userTotal: number,
    onlineUserTotal: number,
    departmentTotal: number,
    pendingLeaveTotal: number,
    pendingLeaveDiff: number,
    monthlyNoticeTotal: number,
    monthlyNoticeDiff: number,
    leaveChartData: LeaveChartData[],
    noticeChartData: NoticeChartData[],
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

const getLeaveNameColor = (name: string) => {
    if (name === "대기") return "text-[#F59E0B]";
    if (name === "승인") return "text-[#34D399]";
    if (name === "반려") return "text-[#F87171]";
}

const now = new Date();

const selectField = Array.from({ length: 6 }, (_, index) => {
    const targetDate = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1,
    );

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const paddedMonth = String(month).padStart(2, "0");

    return {
        label: `${year}년 ${month}월`,
        value: `${year}-${paddedMonth}`,
    }
})

const leaveStatusGuide = [
    { name: "대기", style: "bg-[#F59E0B]" },
    { name: "승인", style: "bg-[#34D399]" },
    { name: "반려", style: "bg-[#F87171]" },
]

const noticePeriodField = [
    { label: "최근 7일", value: "last7Days" },
    { label: "이번 달", value: "thisMonth" },
    { label: "이번 해", value: "thisYear" },
]

export default function AdminDashboard() {
    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [leaveSelectOpen, setLeaveSelectOpen] = useState(false);
    const [noticeSelectOpen, setNoticeSelectOpen] = useState(false);
    const [leaveSelectedMonth, setLeaveSelectedMonth] = useState(selectField[0]);
    const [noticeSelectedPeriod, setNoticeSelectedPeriod] = useState(
        noticePeriodField[0],
    );

    const leaveChartColors = ["#F59E0B", "#34D399", "#F87171"];
    const leaveChartData = summary?.leaveChartData ?? [];
    const totalLeaveCount = leaveChartData.reduce(
        (total, items) => total + items.value, 0
    );

    const fetchSummaryData = async (leaveMonth: string, noticePeriod: string) => {
        const params = new URLSearchParams({
            leaveMonth,
            noticePeriod,
        })
        const res = await fetch(`/api/admin/summary?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) return;

        setSummary(data);
    }

    useEffect(() => {
        fetchSummaryData(
            leaveSelectedMonth.value,
            noticeSelectedPeriod.value,
        );
    }, [leaveSelectedMonth.value, noticeSelectedPeriod.value])

    return (
        <div className="min-h-0 flex flex-col justify-center gap-7 px-8 py-6">
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

            <div className="grid grid-cols-4 gap-5 mt-3">
                {/* 전체 사원 수 */}
                <div className="flex gap-4 rounded-xl shadow-sm px-6 py-8 bg-white/80">
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

                <div className="flex gap-4 rounded-xl shadow-sm px-6 py-8 bg-white/80">
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

                <div className="flex gap-4 rounded-xl shadow-sm px-6 py-8 bg-white/80">
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

                <div className="flex gap-4 rounded-xl shadow-sm px-6 py-8 bg-white/80">
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

            <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-4 rounded-xl shadow-sm bg-white/80 p-6">

                    {/* 제목, select 탭 */}
                    <div className="flex justify-between">
                        <h3 className="font-bold text-base tracking-tight">연차 신청 현황</h3>
                        <div
                            onClick={() => setLeaveSelectOpen((prev) => !prev)}
                            className="relative rounded-xl px-4 py-1 border border-gray-200"
                        >
                            <div className="flex gap-2 items-center">
                                <span>{leaveSelectedMonth.label}</span>
                                {leaveSelectOpen ? (<ChevronRight size={18} />) : (<ChevronDown size={18} />)}
                            </div>

                            {leaveSelectOpen && (
                                <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                                    {selectField.map((option) => (
                                        <button
                                            key={option.label}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLeaveSelectedMonth(option);
                                                setLeaveSelectOpen(false);
                                            }}
                                            className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 연차 상태 가이드 */}
                    <div className="flex gap-6">
                        {leaveStatusGuide.map((status) => {
                            return (
                                <div key={status.name} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${status.style}`}></div>
                                    <p className="text-sm text-gray-500 font-semibold">{status.name}</p>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex gap-5">

                        {/* 차트 */}
                        <div className="relative h-[260px] w-2/5">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={summary?.leaveChartData ?? []}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={70}
                                        outerRadius={105}
                                        shape={(props, index) => (
                                            <Sector
                                                {...props}
                                                fill={leaveChartColors[index]}
                                            />
                                        )}
                                    />

                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-3xl font-bold">{totalLeaveCount}</p>
                                <p className="text-gray-500 font-medium text-sm">전체 신청</p>
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 justify-center gap-6">
                            {summary?.leaveChartData.map((item, index) => {
                                const percent = totalLeaveCount === 0 ? 0 : (item.value / totalLeaveCount) * 100;

                                return (
                                    <div key={item.name} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={`font-semibold ${getLeaveNameColor(item.name)}`}>{item.name}</span>
                                            <div className="grid grid-cols-[48px_64px] items-center text-right">
                                                <span className="font-semibold">{item.value}건</span>
                                                <span className="font-semibold text-gray-400">{Number(percent.toFixed(1))}%</span>
                                            </div>
                                        </div>

                                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${percent}%`,
                                                    backgroundColor: leaveChartColors[index],
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* 오른쪽 그래프 */}
                <div className="flex flex-col gap-4 rounded-xl shadow-sm bg-white/80 p-6">
                    {/* 제목, select 탭 */}
                    <div className="flex justify-between">
                        <h3 className="font-bold text-base tracking-tight">게시글 작성 현황</h3>
                        <div
                            onClick={() => setNoticeSelectOpen((prev) => !prev)}
                            className="relative rounded-xl px-4 py-1 border border-gray-200"
                        >
                            <div className="flex gap-2 items-center">
                                <span>{noticeSelectedPeriod.label}</span>
                                {noticeSelectOpen ? (<ChevronRight size={18} />) : (<ChevronDown size={18} />)}
                            </div>

                            {noticeSelectOpen && (
                                <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                                    {noticePeriodField.map((option) => (
                                        <button
                                            key={option.label}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setNoticeSelectedPeriod(option);
                                                setNoticeSelectOpen(false);
                                            }}
                                            className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}