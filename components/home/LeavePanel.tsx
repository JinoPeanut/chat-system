"use client"

import { LeaveBalance, LeaveHistory, LeaveResponse, LeaveType } from "@/types/leave";
import { ListChecks, PackageOpen, TentTree } from "lucide-react";
import { useEffect, useState } from "react";

type ApplyForm = {
    leaveDate: string,
    leaveType: LeaveType, // "annual" | "half_am" | "half_pm"
    reason: string,
}

const getLeaveColor = (percent: number) => {
    if (percent <= 10) return "bg-green-500"
    if (percent <= 20) return "bg-green-400"
    if (percent <= 30) return "bg-green-300"
    if (percent <= 40) return "bg-lime-300"
    if (percent <= 50) return "bg-yellow-300"
    if (percent <= 60) return "bg-yellow-400"
    if (percent <= 70) return "bg-orange-300"
    if (percent <= 80) return "bg-orange-400"
    if (percent <= 90) return "bg-orange-500"
    return "bg-red-500"
}

export default function LeavePanel() {

    const myUserId = "user-1";
    const myUserName = "홍길동";

    const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
    const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([]);

    const fetchLeaveData = async () => {
        const res = await fetch("/api/leave");
        const data: LeaveResponse = await res.json();
        setLeaveBalance(data.leaveBalance);
        setLeaveHistory(data.leaveHistory);
    };

    const myLeaveBalance = leaveBalance.find((u) => u.userId === myUserId);
    const myLeaveHistory = leaveHistory.filter((h) => h.userId === myUserId);

    // 내역보기 모달 상태값
    const [isOpen, setIsOpen] = useState(false);

    // 연차신청 모달 상태값
    const [isApplyOpen, setIsApplyOpen] = useState(false);

    const [applyForm, setApplyForm] = useState<ApplyForm>({
        leaveDate: "",
        leaveType: "annual",
        reason: "",
    });

    const remainDays = myLeaveBalance ? myLeaveBalance?.totalDays - myLeaveBalance?.usedDays : 0;
    const remainHours = myLeaveBalance ? 8 - myLeaveBalance.useHours : 0;
    const usedDays = myLeaveBalance ? myLeaveBalance.usedDays : 0;
    const leavePercent = myLeaveBalance ? Math.min(100, (myLeaveBalance?.usedDays / myLeaveBalance.totalDays) * 100) : 0;

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const openApplyModal = () => setIsApplyOpen(true);
    const closeApplyModal = () => setIsApplyOpen(false);

    function handleChangeLeaveDate(e: React.ChangeEvent<HTMLInputElement>) {
        setApplyForm((prev) => ({ ...prev, leaveDate: e.target.value }));
    }

    function handleChangeLeaveType(e: React.ChangeEvent<HTMLSelectElement>) {
        setApplyForm((prev) => ({
            ...prev,
            leaveType: e.target.value as "annual" | "half_am" | "half_pm"
        }));
    }

    function handleChangeReason(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setApplyForm((prev) => ({ ...prev, reason: e.target.value }));
    }

    function getUsageByLeaveType(leaveType: LeaveType) {
        if (leaveType === "annual") {
            return { usedDays: 1, usedHours: 8 };
        }
        return { usedDays: 0.5, usedHours: 4 };
    }

    function handleSubmitApply() {
        if (!applyForm.leaveDate) return;

        const { usedDays, usedHours } = getUsageByLeaveType(applyForm.leaveType);

        const newHistory: LeaveHistory = {
            id: crypto.randomUUID(),
            userId: myUserId,
            leaveDate: applyForm.leaveDate,
            leaveType: applyForm.leaveType,
            usedDays,
            usedHours,
            status: "pending",
            reason: applyForm.reason.trim() || undefined,
            createdAt: new Date().toISOString(),
        };

        setLeaveHistory((prev) => [...prev, newHistory]);

        setApplyForm({
            leaveDate: "",
            leaveType: "annual",
            reason: "",
        })

        closeApplyModal();
    }

    useEffect(() => {
        fetchLeaveData();
    }, [])

    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                closeModal();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen])

    useEffect(() => {
        if (!isApplyOpen) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                closeApplyModal();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isApplyOpen])

    return (
        <div className="
                border border-gray-200 rounded-md
                px-2 shadow-lg min-h-[45%]
            ">
            <div className="pb-4">
                <h2 className="text-sm font-bold pt-3">
                    휴가 관리
                </h2>
            </div>

            {/* 연차카드 */}
            <div className="grid grid-cols-3 gap-2">

                {/* 잔여 연차 */}
                <div className="col-span-1 flex-col items-start bg-gray-300/80
                    rounded-md h-[7rem] p-2 group hover:bg-blue-200"
                >
                    <TentTree size={26} className="text-gray-400 group-hover:text-blue-500" />
                    <p className="text-xs leading-tight pt-5 text-gray-500 font-bold
                        group-hover:text-blue-500
                    ">
                        잔여 연차
                    </p>
                    <p className="font-bold">
                        {Math.floor(remainDays)}일
                    </p>
                    <p className="text-xs leading-tight text-gray-500 group-hover:text-blue-500">
                        {remainHours}시간
                    </p>
                </div>

                {/* 사용 연차 */}
                <div className="col-span-1 flex-col items-start bg-gray-300/80
                    rounded-md h-[7rem] p-2 group hover:bg-blue-200"
                >
                    <ListChecks size={26} className="text-gray-400 group-hover:text-blue-500" />
                    <p className="text-xs leading-tight pt-5 text-gray-500 font-bold
                        group-hover:text-blue-500
                    ">
                        사용 연차
                    </p>
                    <p className="font-bold">
                        {Math.floor(usedDays)}일
                    </p>
                    <p className="text-xs leading-tight text-gray-500 group-hover:text-blue-500">
                        {myLeaveBalance?.useHours}시간
                    </p>
                </div>

                {/* 총 연차 */}
                <div className="col-span-1 flex-col items-start bg-gray-300/80
                    rounded-md h-[7rem] p-2 group hover:bg-blue-200"
                >
                    <PackageOpen size={26} className="text-gray-400 group-hover:text-blue-500" />
                    <p className="text-xs leading-tight pt-5 text-gray-500 font-bold
                        group-hover:text-blue-500
                    ">
                        총 연차
                    </p>
                    <p className="font-bold">
                        {myLeaveBalance?.totalDays}일
                    </p>
                </div>
            </div>

            {/* 남은 연차 비율 */}
            <div className="mt-3 flex items-center justify-center mx-6">
                <p className={`
                    ${getLeaveColor(Number(leavePercent.toFixed(0)))}
                    rounded-md py-1 text-center text-xs break-words
                    w-full
                `}>
                    총 연차중 {leavePercent.toFixed(0)}% 소진했습니다.
                </p>
            </div>

            <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`${getLeaveColor(leavePercent)} h-2 rounded-full`}
                        style={{ width: `${leavePercent}%` }}
                    />
                </div>
            </div>

            <div className="mt-3 flex gap-2">
                <button
                    onClick={openApplyModal}
                    className="flex-1 bg-green-500 text-white rounded-md py-2 text-sm hover:bg-green-400">
                    연차 신청
                </button>
                <button
                    onClick={openModal}
                    className="flex-1 bg-gray-200 rounded-md py-2 text-sm hover:bg-gray-300
                ">
                    내역 보기
                </button>
            </div>

            {isOpen &&
                (<div
                    onClick={closeModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-4 rounded-md"
                    >
                        <div className="grid grid-cols-7 gap-3 border-b pb-2 text-sm font-bold text-center">
                            <p>이름</p>
                            <p>사용 날짜</p>
                            <p>휴가 유형</p>
                            <p>사용량</p>
                            <p>신청 상태</p>
                            <p>사유</p>
                            <p>신청 일시</p>
                        </div>

                        <div className="max-h-[360px] overflow-y-auto">
                            {leaveHistory.length === 0
                                ? <p className="py-6 text-center text-sm text-gray-500">내역이 없습니다</p>
                                : (myLeaveHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-7 gap-2 border-b py-2 text-sm text-center"
                                    >
                                        <p>{myUserName}</p>
                                        <p>{item.leaveDate}</p>
                                        <p>{item.leaveType}</p>
                                        <p>{item.usedDays}일 {item.usedHours}시간</p>
                                        <p>{item.status}</p>
                                        <p className="truncate">{item.reason ?? "-"}</p>
                                        <p>{item.createdAt.slice(0, 10)}</p>
                                    </div>
                                )))
                            }
                        </div>
                        <div className="flex items-center justify-center mt-2">
                            <button
                                className="border-gray-300 border py-2 px-4 rounded-md 
                                    hover:bg-gray-300"
                                onClick={closeModal}>
                                닫기
                            </button>
                        </div>
                    </div>
                </div>)
            }

            {isApplyOpen &&
                (<div onClick={closeApplyModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center"
                >
                    <div onClick={(e) => e.stopPropagation()}
                        className="bg-white p-4 rounded-md w-full max-w-md"
                    >
                        <h3 className="text-base font-bold mb-4">연차 신청</h3>

                        <div className="space-y-4">

                            {/* 사용 날짜 */}
                            <div>
                                <label className="block text-sm font-medium mb-1">사용 날짜</label>
                                <input
                                    type="date"
                                    value={applyForm.leaveDate}
                                    onChange={handleChangeLeaveDate}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>

                            {/* 휴가 유형 */}
                            <div>
                                <label className="block text-sm font-medium mb-1">휴가 유형</label>
                                <select
                                    value={applyForm.leaveType}
                                    onChange={handleChangeLeaveType}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="annual">연차</option>
                                    <option value="half_am">오전 반차</option>
                                    <option value="half_pm">오후 반차</option>
                                </select>
                            </div>

                            {/* 사유 */}
                            <div>
                                <label className="block text-sm font-medium mb-1">사유</label>
                                <textarea
                                    value={applyForm.reason}
                                    onChange={handleChangeReason}
                                    placeholder="사유를 입력하세요"
                                    rows={4}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeApplyModal}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-300"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitApply}
                                className="rounded-md bg-green-500 px-3 py-2 text-sm text-white hover:bg-green-400"
                            >
                                신청하기
                            </button>
                        </div>
                    </div>
                </div>)
            }

        </div>
    )
}