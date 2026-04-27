import { getUsageByLeaveType } from "@/utils/leaveUtils";
import { ApplyForm, LeaveBalance, LeaveHistory, LeaveResponse } from "@/types/leave";
import { useEffect, useState } from "react";

export default function useLeavePanel() {
    const myUserId = "user-1";
    const myUserName = "홍길동";

    const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
    const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([]);

    // 내역보기 모달 상태값
    const [isOpen, setIsOpen] = useState(false);

    // 연차신청 모달 상태값
    const [isApplyOpen, setIsApplyOpen] = useState(false);

    const [applyForm, setApplyForm] = useState<ApplyForm>({
        leaveDate: "",
        leaveType: "annual",
        reason: "",
    });

    const fetchLeaveData = async () => {
        const res = await fetch("/api/leave");
        const data: LeaveResponse = await res.json();
        setLeaveBalance(data.leaveBalance);
        setLeaveHistory(data.leaveHistory);
    };

    const myLeaveBalance = leaveBalance.find((u) => u.userId === myUserId);
    const myLeaveHistory = leaveHistory.filter((h) => h.userId === myUserId);

    const remainDays = myLeaveBalance ? myLeaveBalance?.totalDays - myLeaveBalance?.usedDays : 0;
    const remainHours = myLeaveBalance ? 8 - myLeaveBalance.useHours : 0;
    const usedDays = myLeaveBalance ? myLeaveBalance.usedDays : 0;
    const leavePercent = myLeaveBalance
        ? Math.min(100, (myLeaveBalance?.usedDays / myLeaveBalance.totalDays) * 100)
        : 0;

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

    const handleSubmitApply = async () => {
        if (!applyForm.leaveDate) return;

        const { usedDays, usedHours } = getUsageByLeaveType(applyForm.leaveType);

        const res = await fetch("/api/leave", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                id: crypto.randomUUID(),
                userId: myUserId,
                leaveDate: applyForm.leaveDate,
                leaveType: applyForm.leaveType,
                usedDays,
                usedHours,
                status: "pending",
                reason: applyForm.reason.trim() || undefined,
                createdAt: new Date().toISOString(),
            })
        })

        if (!res.ok) return;

        await fetchLeaveData();

        setApplyForm({
            leaveDate: "",
            leaveType: "annual",
            reason: "",
        });

        closeApplyModal();
    }

    useEffect(() => {
        fetchLeaveData();
    }, []);

    return {
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
    }
}