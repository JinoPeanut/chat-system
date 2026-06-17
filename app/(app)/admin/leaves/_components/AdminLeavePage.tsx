"use client"

import { usePagination } from "@/hooks/notice/usePagination";
import { AdminLeave, DepartmentLeaveStat, LeaveStatus } from "@/types/leave";
import { formatCreatedAt } from "@/utils/dateUtils";
import { getLeaveStatus, getLeaveStatusCard, getLeaveTypeText } from "@/utils/statusUtils";
import { Calendar1, CalendarCheck, CalendarDaysIcon, ChevronDown, ChevronRight, Clock, RefreshCcw, User2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LeaveDetailModal from "./LeaveDetailModal";

type DepartmentOption = {
    id: string;
    name: string;
};

type LeaveSummary = {
    totalDays: number,
    usedDays: number,
    remainDays: number,
    usedHours: number,
    useRate: number,
    remainRate: number,
}

type AdminLeaveResponse = {
    message: string,
    leaves: AdminLeave[],
    departmentOptions: DepartmentOption[],
    summary: LeaveSummary,
    page: number,
    limit: number,
    leaveTotal: number,
    totalPages: number,
    departmentStats: DepartmentLeaveStat[],
}

const statusOptions = [
    { label: "전체 상태", value: "" },
    { label: "대기", value: "pending" },
    { label: "승인", value: "approved" },
    { label: "반려", value: "rejected" },
] as const;

export default function AdminLeavePage() {
    const LIMIT = 7;
    const DEPT_LIMIT = 3;

    const [leaveTabs, setLeaveTabs] = useState<"leaveApp" | "leaveCur">("leaveApp");
    const [leave, setLeave] = useState<AdminLeave[]>([]);
    const [departmentStats, setDepartmentStats] = useState<DepartmentLeaveStat[]>([]);

    const [totalPages, setTotalPages] = useState(1);
    const [deptPage, setDeptPage] = useState(1);
    const { page, setPage, nextPage, prevPage } = usePagination({ totalPages });

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [selectStatus, setSelectStatus] = useState<LeaveStatus | "">("");
    const [selectDepartment, setSelectDepartment] = useState("");
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");

    const [selectOpen, setSelectOpen] = useState({
        status: false,
        dept: false,
        periodStart: false,
        periodEnd: false,
    })

    const [summary, setSummary] = useState<LeaveSummary | null>(null);

    const summaryCards = [
        { title: "총 연차 보유일수", value: summary?.totalDays ?? 0, unit: "일", bgColor: "bg-violet-100", IconColor: "text-violet-500", Icon: Calendar1, subTitle: "전체 사원 기준" },
        { title: "총 연차 사용일수", value: summary?.usedDays ?? 0, unit: "일", bgColor: "bg-green-100", IconColor: "text-green-500", Icon: User2, subTitle: `사용률 ${summary?.useRate.toFixed(1) ?? 0}%` },
        { title: "남은 연차일수", value: summary?.remainDays ?? 0, unit: "일", bgColor: "bg-blue-100", IconColor: "text-blue-500", Icon: CalendarCheck, subTitle: `전체 대비 ${summary?.remainRate.toFixed(1) ?? 0}%` },
        { title: "총 연차 사용시간", value: summary?.usedHours ?? 0, unit: "시간", bgColor: "bg-orange-100", IconColor: "text-orange-500", Icon: Clock, subTitle: "전체 사원 기준" },
    ]

    const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
    const [selectDepartmentStat, setSelectDepartmentStat] = useState<DepartmentLeaveStat | null>(null);
    const [leaveDetailModalOpen, setLeaveDetailModalOpen] = useState(false);

    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    const deptTotalPages = Math.max(1, Math.ceil(departmentStats.length / DEPT_LIMIT));

    const currentDepartmentStats = departmentStats.slice(
        (deptPage - 1) * DEPT_LIMIT,
        deptPage * DEPT_LIMIT,
    )

    const showErrorMessage = (message: string) => {
        setErrorMessage(message);

        setTimeout(() => {
            setErrorMessage("");
        }, 1500);
    }

    const fetchLeaveData = async () => {
        if (isProcessing) return;

        const params = new URLSearchParams({
            page: String(page),
            limit: String(LIMIT),
        });

        if (selectStatus) {
            params.set("status", selectStatus);
        }

        if (selectDepartment) {
            params.set("department", selectDepartment);
        }

        if (periodStart) {
            params.set("periodStart", periodStart);
        }

        if (periodEnd) {
            params.set("periodEnd", periodEnd);
        }

        try {
            setIsProcessing(true);

            const res = await fetch(`/api/admin/leaves?${params.toString()}`);
            const data: AdminLeaveResponse = await res.json();

            if (!res.ok) {
                showErrorMessage(data.message ?? "연차 정보를 불러오지 못했습니다.");
                return;
            }

            setLeave(data.leaves);
            setDepartmentOptions(data.departmentOptions);
            setSummary(data.summary);
            setTotalPages(data.totalPages);
            setDepartmentStats(data.departmentStats);

        } catch (error) {
            showErrorMessage("서버와 연결할 수 없습니다.");
        } finally {
            setIsProcessing(false);
        }
    }

    const handleSubmitLeave = async (leaveId: string, status: "approved" | "rejected") => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);

            const res = await fetch(`/api/admin/leaves/${leaveId}`, {
                method: "PATCH",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ status })
            });

            const data = await res.json();

            if (!res.ok) {
                showErrorMessage(data.message ?? "연차 변경에 실패했습니다.");
                return;
            }

            await fetchLeaveData();
        } catch (error) {
            showErrorMessage("서버 연결에 실패했습니다.");
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        fetchLeaveData();
    }, [page, selectStatus, selectDepartment, periodStart, periodEnd])

    return (
        <div className="relative h-[100dvh] w-full flex flex-col gap-2 px-8 py-6">
            <h2 className="font-bold text-lg">연차 관리</h2>
            <p className="font-semibold text-sm text-gray-500">연차 신청 및 사용 현황을 관리하고 승인할 수 있습니다.</p>

            {errorMessage && (
                <div className="absolute right-5 top-15 animate-slide-toast bg-red-100 rounded-md px-4 py-2">
                    <p className="text-sm text-red-500">{errorMessage}</p>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-red-100">
                        <div className="h-full bg-red-500 animate-toast-timer" />
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mt-5">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLeaveTabs("leaveApp")}
                        className={`px-3 py-2 cursor-pointer ${leaveTabs === "leaveApp" ? "border-b-3 border-violet-500 text-violet-500" : "border-b-2 border-transparent text-black"}`}
                    >
                        연차 신청 관리
                    </button>
                    <button
                        onClick={() => setLeaveTabs("leaveCur")}
                        className={`px-3 py-2 cursor-pointer ${leaveTabs === "leaveCur" ? "border-b-3 border-violet-500 text-violet-500" : "border-b-2 border-transparent text-black"}`}
                    >
                        연차 현황
                    </button>
                </div>
            </div>

            {leaveTabs === "leaveApp"
                ? (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">

                            {/* 상태 선택 */}
                            <div
                                onClick={() => setSelectOpen((prev) => ({
                                    ...prev,
                                    status: !prev.status,
                                }))}
                                className="relative w-44 rounded-lg px-4 py-2 border border-gray-300 bg-white"
                            >
                                <div className="flex gap-2 items-center">
                                    <span className="text-center text-gray-600">{selectStatus ? getLeaveStatus(selectStatus) : "전체 상태"}</span>
                                    {selectOpen.status ? (<ChevronRight size={18} className="absolute right-5" />) : (<ChevronDown size={18} className="absolute right-5" />)}
                                </div>
                                {selectOpen.status && (
                                    <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                                        {statusOptions.map((status) => {
                                            return (
                                                <button
                                                    key={status.label}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectStatus(status.value);
                                                        setSelectOpen((prev) => ({
                                                            ...prev,
                                                            status: false,
                                                        }));
                                                        setPage(1);
                                                    }}
                                                    className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                                >
                                                    {status.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* 부서 선택 */}
                            <div
                                onClick={() => setSelectOpen((prev) => ({
                                    ...prev,
                                    dept: !prev.dept,
                                }))}
                                className="relative w-44 rounded-lg px-4 py-2 border border-gray-300 bg-white"
                            >
                                <div className="flex gap-2 items-center">
                                    <span className="text-center text-gray-600">{selectDepartment ? selectDepartment : "전체 부서"}</span>
                                    {selectOpen.dept ? (<ChevronRight size={18} className="absolute right-5" />) : (<ChevronDown size={18} className="absolute right-5" />)}
                                </div>
                                {selectOpen.dept && (
                                    <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                                        {departmentOptions.map((dept) => {
                                            return (
                                                <button
                                                    key={dept.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectDepartment(dept.name);
                                                        setSelectOpen((prev) => ({
                                                            ...prev,
                                                            dept: false,
                                                        }));
                                                        setPage(1);
                                                    }}
                                                    className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                                >
                                                    {dept.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

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

                            {/* 선택 초기화 버튼 */}
                            <button
                                onClick={() => {
                                    setSelectStatus("");
                                    setSelectDepartment("");
                                    setPeriodStart("");
                                    setPeriodEnd("");
                                    setPage(1);
                                }}
                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                            >
                                <RefreshCcw className="refresh-icon" />
                            </button>
                        </div>

                        {/* 연차 관리 대시보드 */}
                        <div className="grid grid-cols-[150px_130px_150px_200px_1fr_200px_200px_150px] mt-3
                            border-t border-l border-r border-gray-300 rounded-t-lg px-4 py-2">
                            <p>신청일</p>
                            <p>신청자</p>
                            <p>부서</p>
                            <p>연차 유형</p>
                            <p>기간</p>
                            <p className="text-end">사용 일수</p>
                            <p className="text-center">상태</p>
                            <p className="text-center">작업</p>
                        </div>

                        <div className="flex flex-col border border-gray-300 rounded-b-lg px-4 bg-white">
                            {leave.map((item, index) => {
                                const isLast = index === leave.length - 1;
                                return (
                                    <div key={item.id}>
                                        <div className="grid grid-cols-[150px_130px_150px_200px_1fr_200px_200px_150px] items-center py-3">
                                            <p>{formatCreatedAt(item.createdAt)}</p>
                                            <p>{item.user.name}</p>
                                            <p>{item.user.department}</p>
                                            <p>{getLeaveTypeText(item.leaveType)}</p>
                                            <p>{formatCreatedAt(item.leaveDate)}</p>
                                            <p className="text-end">
                                                {item.leaveType === "annual" ? `${item.usedDays}일` : `${item.usedHours}시간`}
                                            </p>
                                            <div className={`inline-flex justify-self-center rounded-lg px-2 py-1 w-fit ${getLeaveStatusCard(item.status)}`}>
                                                <p className="text-center">{getLeaveStatus(item.status)}</p>
                                            </div>

                                            {item.status === "pending"
                                                ? <div className="flex justify-center gap-5 text-gray-500">
                                                    <button
                                                        onClick={() => handleSubmitLeave(item.id, "approved")}
                                                        disabled={isProcessing}
                                                        className="border border-gray-200 px-2 py-1 rounded-lg cursor-pointer hover:text-green-500">
                                                        승인
                                                    </button>

                                                    <button
                                                        onClick={() => handleSubmitLeave(item.id, "rejected")}
                                                        disabled={isProcessing}
                                                        className="border border-gray-200 px-2 py-1 rounded-lg cursor-pointer hover:text-red-500">
                                                        반려
                                                    </button>
                                                </div>
                                                : <span className="text-gray-600 text-center">처리 완료</span>
                                            }
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
                : (
                    <div className="flex flex-col">
                        <div className="grid grid-cols-4 gap-4">
                            {summaryCards.map((leave) => {
                                return (
                                    <div key={leave.title}
                                        className="flex items-start gap-4 bg-white rounded-lg shadow-md px-4 py-4"
                                    >
                                        <div className={`rounded-lg p-3 ${leave.bgColor} ${leave.IconColor}`}>
                                            <leave.Icon size={45} />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm text-gray-500 font-semibold">{leave.title}</p>
                                            <div className="flex items-baseline">
                                                <p className="text-2xl font-bold">{leave.value}</p>
                                                <p className="text-sm font-bold">{leave.unit}</p>
                                            </div>
                                            <p className="text-sm text-gray-500 font-semibold">{leave.subTitle}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex gap-4 items-center mt-5">

                            {/* 부서 선택 */}
                            <div
                                onClick={() => setSelectOpen((prev) => ({
                                    ...prev,
                                    dept: !prev.dept,
                                }))}
                                className="relative w-44 rounded-lg px-4 py-2 border border-gray-300 bg-white"
                            >
                                <div className="flex gap-2 items-center">
                                    <span className="text-center text-gray-600">{selectDepartment ? selectDepartment : "전체 부서"}</span>
                                    {selectOpen.dept ? (<ChevronRight size={18} className="absolute right-5" />) : (<ChevronDown size={18} className="absolute right-5" />)}
                                </div>
                                {selectOpen.dept && (
                                    <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                                        {departmentOptions.map((dept) => {
                                            return (
                                                <button
                                                    key={dept.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectDepartment(dept.name);
                                                        setSelectOpen((prev) => ({
                                                            ...prev,
                                                            dept: false,
                                                        }));
                                                        setDeptPage(1);
                                                        setPage(1);
                                                    }}
                                                    className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                                >
                                                    {dept.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* 선택 초기화 버튼 */}
                            <button
                                onClick={() => {
                                    setSelectStatus("");
                                    setSelectDepartment("");
                                    setPeriodStart("");
                                    setPeriodEnd("");
                                    setDeptPage(1);
                                    setPage(1);
                                }}
                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                            >
                                <RefreshCcw className="refresh-icon" />
                            </button>
                        </div>

                        <div className="flex flex-col mt-5 shadow-md bg-white rounded-lg px-4 py-6">
                            <h2 className="font-bold text-base">부서별 연차 현황</h2>

                            <div className="grid grid-cols-[1fr_180px_180px_180px_240px_200px_160px] mt-3
                            border-t border-l border-r border-gray-300 rounded-t-lg px-4 py-2 bg-gray-100 text-gray-500 font-semibold">
                                <p className="text-left text-sm">부서명</p>
                                <p className="text-center text-sm">보유일수</p>
                                <p className="text-center text-sm">사용일수</p>
                                <p className="text-center text-sm">남은일수</p>
                                <p className="text-center text-sm">사용률</p>
                                <p className="text-center text-sm">평균 사용일수</p>
                                <p className="text-center text-sm">상세</p>
                            </div>

                            <div className="flex flex-col border border-gray-300 rounded-b-lg px-4 bg-white font-medium">
                                {currentDepartmentStats.length === 0
                                    ? (<div className="py-8 text-center text-sm text-gray-400">
                                        조회된 부서별 연차 현황이 없습니다.
                                    </div>)
                                    : (currentDepartmentStats.map((dept, index) => {

                                        const isLast = index === currentDepartmentStats.length - 1;

                                        return (
                                            <div key={dept.departmentId}>
                                                <div className="grid grid-cols-[1fr_180px_180px_180px_240px_200px_160px] items-center py-3">
                                                    <p className="text-left text-sm">{dept.department}</p>
                                                    <p className="text-center text-sm">{dept.totalDays}</p>
                                                    <p className="text-center text-sm">{dept.usedDays}</p>
                                                    <p className="text-center text-sm">{dept.remainDays}</p>
                                                    <div className="flex items-center justify-center text-sm">
                                                        <div className="flex w-[180px] items-center gap-3">
                                                            <div className="w-30 h-2 rounded-full bg-gray-100">
                                                                <div className="h-full rounded-full bg-violet-500" style={{ width: `${dept.useRate}%` }} />
                                                            </div>
                                                            <span className="w-12 text-right">
                                                                {dept.useRate.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-center text-sm">{dept.averageUsedDays.toFixed(1)}일</p>
                                                    <div className="flex justify-center text-sm">
                                                        <button onClick={() => {
                                                            setLeaveDetailModalOpen(true)
                                                            setSelectDepartmentStat(dept)
                                                        }}
                                                            className="border border-gray-200 px-4 py-2 rounded-lg cursor-pointer
                                                                hover:bg-gray-200"
                                                        >
                                                            조회
                                                        </button>
                                                    </div>
                                                </div>

                                                {!isLast && <div className="w-full h-[1px] bg-gray-200" />}
                                            </div>
                                        )
                                    }))}
                            </div>
                        </div>

                        <div className="flex justify-center items-center gap-4 mt-4">
                            <button
                                onClick={() => setDeptPage((prev) => Math.max(1, prev - 1))}
                                disabled={deptPage === 1}
                                className="px-3 py-1 border rounded disabled:opacity-40"
                            >
                                이전
                            </button>
                            <span className="text-sm font-medium">
                                {deptPage} / {deptTotalPages}
                            </span>
                            <button
                                onClick={() => setDeptPage((prev) => Math.min(deptTotalPages, prev + 1))}
                                disabled={deptPage === deptTotalPages}
                                className="px-3 py-1 border rounded disabled:opacity-40"
                            >
                                다음
                            </button>
                        </div>

                        {leaveDetailModalOpen && selectDepartmentStat &&
                            (<LeaveDetailModal
                                onClose={() => {
                                    setLeaveDetailModalOpen(false)
                                    setSelectDepartmentStat(null);
                                }}
                                department={selectDepartmentStat}
                            />)
                        }
                    </div>
                )
            }
        </div>
    )
}