"use client"

import { usePagination } from "@/hooks/notice/usePagination";
import { AdminLeave } from "@/types/leave";
import { useEffect, useState } from "react";

type AdminLeaveResponse = {
    message: string,
    leaves: AdminLeave[],
    page: number,
    limit: number,
    leaveTotal: number,
    totalPages: number,
}

export default function AdminLeavePage() {
    const LIMIT = 7;

    const [leaveTabs, setLeaveTabs] = useState<"leaveApp" | "leaveCur">("leaveApp");
    const [leave, setLeave] = useState<AdminLeave[]>([]);

    const [totalPages, setTotalPages] = useState(1);
    const { page, setPage, nextPage, prevPage } = usePagination({ totalPages });

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [selectStatus, setSelectStatus] = useState("");
    const [selectDepartment, setSelectDepartment] = useState("");
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");

    const fetchLeaveData = async () => {
        if (isProcessing) return;
        setErrorMessage("");

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
                setErrorMessage(data.message ?? "연차 정보를 불러오지 못했습니다.");
                return;
            }

            setLeave(data.leaves);
            setTotalPages(data.totalPages);

        } catch (error) {
            setErrorMessage("서버와 연결할 수 없습니다.");
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {

    }, [page, selectStatus, selectDepartment, periodStart, periodEnd])

    return (
        <div className="h-[100dvh] w-full flex flex-col gap-2 px-8 py-6">
            <h2 className="font-bold text-lg">연차 관리</h2>
            <p className="font-semibold text-sm text-gray-500">연차 신청 및 사용 현황을 관리하고 승인할 수 있습니다.</p>

            <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLeaveTabs("leaveApp")}
                        className={`px-3 py-2 ${leaveTabs === "leaveApp" ? "border-b-3 border-violet-500 text-violet-500" : "border-b-2 border-transparent text-black"}`}
                    >
                        연차 신청 관리
                    </button>
                    <button
                        onClick={() => setLeaveTabs("leaveCur")}
                        className={`px-3 py-2 ${leaveTabs === "leaveCur" ? "border-b-3 border-violet-500 text-violet-500" : "border-b-2 border-transparent text-black"}`}
                    >
                        연차 현황
                    </button>
                </div>
            </div>

            {leaveTabs === "leaveApp"
                ? (
                    <div>

                    </div>
                )
                : (
                    <div></div>
                )
            }
        </div>
    )
}