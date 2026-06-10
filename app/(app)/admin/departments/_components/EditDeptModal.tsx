"use client"

import { useState } from "react"
import { ManagerCandidate } from "./AdminDeptPage"
import { AdminDepartment } from "@/types/department"
import { ChevronDown, ChevronRight, CircleAlert } from "lucide-react"

type EditDeptModalProps = {
    department: AdminDepartment | null,
    fetchDeptData: () => Promise<void>,
    onClose: () => void,
    managerCandidates: ManagerCandidate[],
}

type EditDeptForm = {
    name: string,
    description: string,
    managerId: string,
}

export default function EditDeptModal({ department, fetchDeptData, onClose, managerCandidates }: EditDeptModalProps) {

    const [form, setForm] = useState({
        name: department?.name ?? "",
        managerId: department?.managerId ?? "",
        description: department?.description ?? "",
    })

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [managerIdOpen, setManagerIdOpen] = useState(false);

    const selectManager = managerCandidates.find(
        (manager) => manager.id === form.managerId
    );

    const showErrorMessage = (message: string) => {
        setErrorMessage(message);

        setTimeout(() => {
            setErrorMessage("");
        }, 1500);
    }

    const handleEditDept = async (form: EditDeptForm) => {
        if (isProcessing) return;

        if (!form.name.trim()) {
            showErrorMessage("부서명을 입력해 주세요.");
            return;
        }

        try {
            setIsProcessing(true);

            const res = await fetch(`/api/admin/departments/${department?.id}`, {
                method: "PATCH",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    managerId: form.managerId,
                    description: form.description,
                })
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

                <div className="flex flex-col gap-3">
                    {/* 상단 제목 */}
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold tracking-tight">부서 추가</h3>
                    </div>

                    <div className="flex flex-col gap-1 mt-5">
                        <label className="text-sm text-gray-500 font-semibold">
                            부서명
                            <span className="text-red-500"> *</span>
                        </label>
                        <input
                            type="text"
                            inputMode="text"
                            value={form.name ?? ""}
                            placeholder="부서를 입력하세요."
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="outline-none border border-gray-200 rounded-md px-4 py-2"
                        />
                    </div>

                    <div className="flex flex-col gap-1 mt-5">
                        <label className="text-sm text-gray-500 font-semibold">
                            부서장
                        </label>
                        <div
                            onClick={() => setManagerIdOpen((prev) => !prev)}
                            className="relative rounded-md px-4 py-2 border border-gray-200"
                        >
                            <div className="flex gap-2 items-center">
                                <span>{selectManager ? `${selectManager.name} ${selectManager.position}` : (<p className="text-gray-500">부서장을 선택하세요. (선택사항)</p>)}</span>
                                {managerIdOpen ? (<ChevronRight size={18} className="absolute right-5" />) : (<ChevronDown size={18} className="absolute right-5" />)}
                            </div>

                            {managerIdOpen && (
                                <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-md">
                                    {managerCandidates.map((manager) => {
                                        return (
                                            <button
                                                key={manager.id}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        managerId: manager.id,
                                                    }));
                                                    setManagerIdOpen(false);
                                                }}
                                                className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                            >
                                                {manager.name} {manager.position}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-5">
                        <label className="text-sm text-gray-500 font-semibold">
                            설명
                        </label>
                        <textarea
                            value={form.description}
                            placeholder="부서 설명을 입력하세요 (선택사항)"
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            className="min-h-24 resize-none outline-none border border-gray-200 rounded-md px-4 py-2"
                        />
                    </div>

                    <div className="flex gap-2 rounded-md bg-violet-100 px-6 py-4 text-violet-600">
                        <CircleAlert size={18} />
                        <p className="text-sm font-medium">부서명은 필수 입력 항목입니다.</p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-md border border-gray-200 px-8 py-2 cursor-pointer hover:bg-gray-100">
                            취소
                        </button>
                        <button
                            onClick={() => handleEditDept(form)}
                            disabled={isProcessing}
                            className="rounded-md bg-violet-500 text-white px-8 py-2 cursor-pointer hover:bg-violet-400
                                disabled:opacity-50 disabled:cursor-not-allowed">
                            {isProcessing ? "수정 중..." : "수정"}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}