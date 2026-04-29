"use client"

import { ListChecks, PackageOpen, TentTree } from "lucide-react";
import { useEffect } from "react";
import LeaveApplyModal from "./LeaveApplyModal";
import LeaveHistoryModal from "./LeaveHistoryModal";
import LeaveSummaryCard from "./LeaveSummaryCard";
import { getLeaveColor } from "../../../utils/leaveUtils";
import useLeavePanel from "@/hooks/leave/useLeavePanel";

export default function LeavePanel() {

    const {
        myUserName,
        isOpen,
        isApplyOpen,
        applyForm,
        myLeaveBalance,
        myLeaveHistory,
        remainDays,
        remainHours,
        usedDays,
        leavePercent,
        openModal,
        closeModal,
        openApplyModal,
        closeApplyModal,
        handleChangeLeaveDate,
        handleChangeLeaveType,
        handleChangeReason,
        handleSubmitApply,
    } = useLeavePanel();


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
                <LeaveSummaryCard
                    LucideIcon={TentTree}
                    title="잔여 연차"
                    days={remainDays}
                    hours={remainHours}
                />

                {/* 사용 연차 */}
                <LeaveSummaryCard
                    LucideIcon={ListChecks}
                    title="사용 연차"
                    days={usedDays}
                    hours={myLeaveBalance?.useHours}
                />

                {/* 총 연차 */}
                <LeaveSummaryCard
                    LucideIcon={PackageOpen}
                    title="총 연차"
                    days={myLeaveBalance ? myLeaveBalance?.totalDays : 0}
                />
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

            {/* 남은 연차 게이지 */}
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
                    className="flex-1 bg-green-500 text-white rounded-md py-2 text-sm hover:bg-green-400 cursor-pointer">
                    연차 신청
                </button>
                <button
                    onClick={openModal}
                    className="flex-1 bg-gray-200 rounded-md py-2 text-sm hover:bg-gray-300 cursor-pointer
                ">
                    내역 보기
                </button>
            </div>

            {/* 내역보기 모달 */}
            <LeaveHistoryModal
                isOpen={isOpen}
                closeModal={closeModal}
                myLeaveHistory={myLeaveHistory}
                myUserName={myUserName}
            />

            {/* 연차신청 모달 */}
            <LeaveApplyModal
                isApplyOpen={isApplyOpen}
                closeApplyModal={closeApplyModal}
                applyForm={applyForm}
                onChangeLeaveDate={handleChangeLeaveDate}
                onChangeLeaveType={handleChangeLeaveType}
                onChangeReason={handleChangeReason}
                handleSubmitApply={handleSubmitApply}
            />
        </div>
    )
}