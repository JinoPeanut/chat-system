"use client"

import { useState } from "react";

type DeleteDeptModalProps = {
    department: {
        id: string,
    },
    fetchDeptData: () => Promise<void>,
    onClose: () => void,
}

export default function DeleteDeptModal({ department, fetchDeptData, onClose }: DeleteDeptModalProps) {

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const showErrorMessage = (message: string) => {
        setErrorMessage(message);

        setTimeout(() => {
            setErrorMessage("");
        }, 1500);
    }

    const handleDeleteDept = async () => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);

            const res = await fetch(`/api/admin/departments/${department?.id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                showErrorMessage(data.message ?? "부서 추가에 실패했습니다.");
                return;
            }

            await fetchDeptData();
            onClose();

        } catch (error) {
            showErrorMessage("서버와 연결할 수 없습니다.");
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()}
                className="relative bg-white p-4 rounded-md w-full max-w-lg">

                {errorMessage && (
                    <div className="absolute right-5 top-15 animate-slide-toast bg-red-100 rounded-md px-4 py-2">
                        <p className="text-sm text-red-500">{errorMessage}</p>

                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-red-100">
                            <div className="h-full bg-red-500 animate-toast-timer" />
                        </div>
                    </div>
                )}

                <div className="flex justify-center items-center">
                    <h3 className="font-semibold tracking-tight">정말로 삭제하시겠습니까?</h3>
                </div>

                <div className="flex justify-center items-center gap-5 mt-5">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-gray-200 px-8 py-2 cursor-pointer hover:bg-gray-100">
                        취소
                    </button>
                    <button
                        onClick={handleDeleteDept}
                        disabled={isProcessing}
                        className="rounded-md bg-red-500 text-white px-8 py-2 cursor-pointer hover:bg-red-400
                                disabled:opacity-50 disabled:cursor-not-allowed">
                        {isProcessing ? "삭제 중..." : "삭제"}
                    </button>
                </div>
            </div>
        </div>
    )
}