import { ApplyForm, LeaveBalance, LeaveHistory } from "@/types/leave";
import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

type useLeavePanelProps = {
    leave: {
        leaveBalance: LeaveBalance,
        leaveHistory: LeaveHistory[],
    }
    onRefresh: () => Promise<void>,
}

export default function useLeavePanel({ leave, onRefresh }: useLeavePanelProps) {
    const authUser = useAuthStore((state) => state.user);
    const myUserName = authUser?.name;

    const [errorMessage, setErrorMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // 내역보기 모달 상태값
    const [isOpen, setIsOpen] = useState(false);

    // 연차신청 모달 상태값
    const [isApplyOpen, setIsApplyOpen] = useState(false);

    const [applyForm, setApplyForm] = useState<ApplyForm>({
        leaveDate: "",
        leaveType: "annual",
        reason: "",
    });

    const leaveBalance = leave.leaveBalance;
    const leaveHistory = leave.leaveHistory;

    const remainDays = leaveBalance.remainDays;
    const remainHours = leaveBalance.remainHours
    const usedDays = leaveBalance.usedDays;
    const useHours = leaveBalance.useHours;
    const totalDays = leaveBalance.totalDays;
    const leavePercent = leaveBalance.leavePercent;

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const openApplyModal = () => {
        setErrorMessage("");
        setIsApplyOpen(true)
    };
    const closeApplyModal = () => {
        setErrorMessage("");
        setIsApplyOpen(false);
    };

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

    // Leave 데이터 만들기
    const handleSubmitApply = async () => {
        if (isProcessing) return;
        if (!applyForm.leaveDate) {
            setErrorMessage("사용 날짜를 선택해 주세요.");
            return;
        }

        setErrorMessage("");

        try {
            setIsProcessing(true);

            const res = await fetch("/api/leave", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    leaveDate: applyForm.leaveDate,
                    leaveType: applyForm.leaveType,
                    reason: applyForm.reason.trim() || undefined,
                })
            })

            if (!res.ok) {
                const data = await res.json();
                setErrorMessage(data.message ?? "연차를 신청할 수 없습니다");
                return;
            }

            await onRefresh();

            setApplyForm({
                leaveDate: "",
                leaveType: "annual",
                reason: "",
            });

            closeApplyModal();
        } catch (error) {
            setErrorMessage("서버에 연결할 수 없습니다");
        } finally {
            setIsProcessing(false);
        }
    }

    // Leave 데이터 수정
    const handleApproveLeave = async (leaveId: string) => {
        const res = await fetch("/api/leave/approve", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ leaveId }),
        });

        if (!res.ok) return;

        await onRefresh();
    };

    return {
        myUserName,
        isOpen,
        isApplyOpen,
        applyForm,
        leaveBalance,
        leaveHistory,
        remainDays,
        remainHours,
        usedDays,
        useHours,
        totalDays,
        leavePercent,
        openModal,
        closeModal,
        openApplyModal,
        closeApplyModal,
        handleChangeLeaveDate,
        handleChangeLeaveType,
        handleChangeReason,
        handleSubmitApply,
        handleApproveLeave,
        errorMessage,
        isProcessing,
    }
}