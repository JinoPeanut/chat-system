"use client";

import { User } from "@/types/chat";
import { Building2Icon, Calendar, CalendarCheck, ChevronDown, ChevronRight, ClipboardCheck, FileText, Megaphone, ShieldCog, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Sector,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    CartesianGrid,
    XAxis,
    YAxis,
    AreaChart,
    Area,
} from "recharts";
import AdminSummaryCard from "./AdminSummaryCard";
import AdminQuickMenu from "./AdminQuickMenu";

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

export const formatDiff = (diff: number, unit: string) => {
    if (diff > 0) return `▲ ${diff}${unit}`;
    if (diff < 0) return `▼ ${Math.abs(diff)}${unit}`;
    return `- 0${unit}`;
}

export const getDiffColor = (diff: number) => {
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

const AdminQuickMenuField = [
    {
        title: "사원 관리",
        href: "/admin/users",
        Icon: UsersRound,
        IconClassName: "bg-violet-200 text-violet-500",
        description: "사원 정보 조회 및 등록/수정/삭제"
    },
    {
        title: "부서 관리",
        href: "/admin/departments",
        Icon: Building2Icon,
        IconClassName: "bg-blue-200 text-blue-500",
        description: "부서 정보 및 구조 관리",
    },
    {
        title: "연차 관리",
        href: "/admin/leaves",
        Icon: Calendar,
        IconClassName: "bg-orange-200 text-orange-500",
        description: "연차 신청 내역 확인 및 승인/반려 처리"
    },
    {
        title: "게시글 관리",
        href: "admin/notices",
        Icon: FileText,
        IconClassName: "bg-green-200 text-green-500",
        description: "게시판 글 관리 및 카테고리 설정",
    },
    {
        title: "권한 관리",
        href: "admin/permissions",
        Icon: ShieldCog,
        IconClassName: "bg-red-200 text-red-500",
        description: "관리자 및 역할 권한 설정"
    },
]


type ActivityLogType = "notice" | "leave" | "default";


type AdminActivityLog = {
    id: number;
    type: ActivityLogType;
    message: string;
    time: string;
};
const adminActivityLogs: AdminActivityLog[] = [
    {
        id: 1,
        type: "default",
        message: "관리자가 사원 '김철수'님의 정보를 수정했습니다.",
        time: "10분 전",
    },
    {
        id: 2,
        type: "leave",
        message: "관리자가 연차 신청(이유리)을 승인 처리했습니다.",
        time: "1시간 전",
    },
    {
        id: 3,
        type: "notice",
        message: "관리자가 공지사항 '5월 전체 회의 안내'를 등록했습니다.",
        time: "3시간 전",
    },
    {
        id: 4,
        type: "default",
        message: "관리자가 부서 '마케팅팀'을 추가했습니다.",
        time: "5시간 전",
    },
];

const getActivityIcon = (type: ActivityLogType) => {
    if (type === "notice") return Megaphone
    if (type === "leave") return CalendarCheck
    return ClipboardCheck
}

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
                <AdminSummaryCard
                    IconClassName="bg-violet-200 text-violet-500"
                    Icon={UsersRound}
                    title="전체 사원 수"
                    total={summary?.userTotal}
                    unit="명"
                    description="현재 온라인 유저"
                    diff={summary?.onlineUserTotal ?? 0}
                    diffUnit="명"
                />

                <AdminSummaryCard
                    IconClassName="bg-blue-200 text-blue-500"
                    Icon={Building2Icon}
                    title="부서 수"
                    total={summary?.departmentTotal}
                    unit="개"
                    description="현재 등록된 부서"
                />

                <AdminSummaryCard
                    IconClassName="bg-orange-200 text-orange-500"
                    Icon={Calendar}
                    title="대기 중 연차 신청 수"
                    total={summary?.pendingLeaveTotal}
                    unit="건"
                    description="전월 대비"
                    diff={summary?.pendingLeaveDiff ?? 0}
                    diffUnit="건"
                />

                <AdminSummaryCard
                    IconClassName="bg-green-200 text-green-500"
                    Icon={FileText}
                    title="이번 달 게시글 수"
                    total={summary?.monthlyNoticeTotal}
                    unit="건"
                    description="전월 대비"
                    diff={summary?.monthlyNoticeDiff ?? 0}
                    diffUnit="건"
                />
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

                    {/* 선 그래프 차트 */}
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={summary?.noticeChartData ?? []}>
                            <defs>
                                <linearGradient id="noticeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="0%"
                                        stopColor="#8B5CF6"
                                        stopOpacity={0.35}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#8B5CF6"
                                        stopOpacity={0.03}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />

                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                fill="url(#noticeGradient)"
                                dot={{
                                    r: 4,
                                    fill: "#FFFFFF",
                                    stroke: "#8B5CF6",
                                    strokeWidth: 2,
                                }}
                                activeDot={{
                                    r: 6,
                                    fill: "#FFFFFF",
                                    stroke: "#8B5CF6",
                                    strokeWidth: 2,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 관리자 메뉴 바로가기 */}
            <div className="flex flex-col gap-3">
                <h3 className="font-bold text-lg tracking-tight">관리자 메뉴 바로가기</h3>
                <div className="grid grid-cols-5 gap-2">
                    {AdminQuickMenuField.map((menu) => {
                        return (
                            <AdminQuickMenu
                                key={menu.title}
                                href={menu.href}
                                IconClassName={menu.IconClassName}
                                Icon={menu.Icon}
                                title={menu.title}
                                description={menu.description}
                            />
                        )
                    })}
                </div>
            </div>

            {/* 최근 활동 로그 */}
            <div className="flex flex-col gap-1 w-full bg-white/80 p-8 rounded-xl shadow-sm">
                <div className="flex justify-between items-center">
                    <p className="text-base tracking-tight font-semibold">최근 활동 로그</p>
                    <div
                        //onClick={}
                        className="flex gap-3 items-center justify-between border border-gray-300 text-gray-500 rounded-lg px-4 py-2 cursor-pointer"
                    >
                        <p className="text-sm">전체 보기</p>
                        <ChevronRight size={18} />
                    </div>
                </div>

                {adminActivityLogs.map((log, index) => {
                    const Icon = getActivityIcon(log.type);
                    const isLast = index === adminActivityLogs.length - 1;
                    return (
                        <div key={log.id} className="flex flex-col">
                            <div className="flex items-center justify-between px-2 py-3">
                                <div className="flex items-center justify-center gap-2">
                                    <Icon size={14} className="w-9 h-9 text-gray-500 bg-gray-100 rounded-full p-2" />
                                    <p className="text-gray-600 font-semibold text-sm">{log.message}</p>
                                </div>
                                <p className="text-gray-600 font-semibold text-sm">
                                    {log.time}
                                </p>
                            </div>
                            {isLast ? <></> : <span className="h-[1px] w-full bg-gray-200" />}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}