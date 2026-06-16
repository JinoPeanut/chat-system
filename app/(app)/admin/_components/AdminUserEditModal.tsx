"use client"

import ProfileAvatar from "@/components/common/ProfileAvatar"
import { User } from "@/types/chat"
import { getStatusCardColor, getStatusColor, getStatusText } from "@/utils/statusUtils"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { DepartmentOption } from "@/types/department"
import { formatCreatedAt } from "@/utils/dateUtils"

type AdminUserEditModalProps = {
    user: User,
    onClose: () => void,
    departmentOptions: DepartmentOption[],
    positionOptions: string[],
    onSuccess: () => Promise<void>,
}

const userRoleField = [
    { role: "USER" },
    { role: "ADMIN" },
] as const

export default function AdminUserEditModal({ user, onClose, departmentOptions, positionOptions, onSuccess }: AdminUserEditModalProps) {

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [editOpen, setEditOpen] = useState({
        department: false,
        position: false,
        role: false,
    });
    const [form, setForm] = useState({
        department: user.department,
        position: user.position,
        role: user.role,
        tel: user.profile?.tel ?? "",
        statusMsg: user.profile?.statusMsg ?? "",
        bestWorker: user.profile?.bestWorker ?? false,
    });

    const handleToggleSelct = (key: "department" | "position" | "role", value?: boolean) => {
        setEditOpen((prev) => ({
            ...prev,
            [key]: value ?? !prev[key],
        }))
    }

    const handleChange = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleBestWorker = () => {
        setForm((prev) => ({
            ...prev,
            bestWorker: !prev.bestWorker
        }))
    }

    const handleTelChange = (value: string) => {
        const onlyNumber = value.replace(/\D/g, "").slice(0, 11);

        let formattedTel = onlyNumber;

        if (onlyNumber.length > 7) {
            formattedTel = `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3, 7)}-${onlyNumber.slice(7)}`
        } else if (onlyNumber.length > 3) {
            formattedTel = `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3)}`
        }

        handleChange("tel", formattedTel);
    }

    const handleSumbmit = async () => {
        if (isProcessing) return;
        setErrorMessage("");

        try {
            setIsProcessing(true);

            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    ...form,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrorMessage(data.message ?? "사원 정보 수정에 실패했습니다.");
                return false;
            }

            await onSuccess();
            onClose();
        } catch (error) {
            setErrorMessage("서버 연결에 실패했습니다.");
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()}
                className="bg-white p-4 rounded-md w-full max-w-lg">
                {errorMessage && (
                    <p className="text-sm text-red-500">{errorMessage}</p>
                )}
                <div className="flex flex-col">
                    {/* 상단 제목 */}
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold tracking-tight">사원 정보 수정</h3>
                    </div>

                    <div className="grid grid-cols-[170px_1fr] justify-center items-start gap-2 mt-10">
                        <div className="flex flex-col justify-center items-center gap-3 px-6">
                            <ProfileAvatar
                                src={user.profilePic}
                                size={120}
                                alt={`${user.name}의 프로필`}
                            />

                            <p className="font-semibold">{user.name}</p>

                            <div className={`flex items-center gap-1 rounded-full px-4 py-1 ${getStatusCardColor(user.status)}`}>
                                <div className={`w-2 h-2 ${getStatusColor(user.status)} rounded-full`} />
                                <p>{getStatusText(user.status)}</p>
                            </div>

                            <p className="text-sm text-gray-500">{user.email}</p>

                            <p className="text-sm text-gray-500">가입일: {formatCreatedAt(user.createdAt)}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <p className="font-semibold tracking-tight">기본 정보</p>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-gray-500 font-semibold">
                                    부서
                                    <span className="text-red-500"> *</span>
                                </label>
                                <div
                                    onClick={() => handleToggleSelct("department")}
                                    className="relative rounded-md px-4 py-1 border border-gray-200"
                                >
                                    <div className="flex gap-2 items-center">
                                        <span>{form.department || user.department}</span>
                                        {editOpen.department ? (<ChevronRight size={18} className="absolute right-5" />) : (<ChevronDown size={18} className="absolute right-5" />)}
                                    </div>

                                    {editOpen.department && (
                                        <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-md">
                                            {departmentOptions.map((department) => {
                                                return (
                                                    <button
                                                        key={department.id}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleChange("department", department.name);
                                                            handleToggleSelct("department", false);
                                                        }}
                                                        className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                                    >
                                                        {department.name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-gray-500 font-semibold">
                                    직급
                                    <span className="text-red-500"> *</span>
                                </label>
                                <div
                                    onClick={() => handleToggleSelct("position")}
                                    className="relative rounded-md px-4 py-1 border border-gray-200"
                                >
                                    <div className="flex gap-2 items-center">
                                        <span>{form.position}</span>
                                        {editOpen.position ? (<ChevronRight size={18} className="absolute right-5" />) : (<ChevronDown size={18} className="absolute right-5" />)}
                                    </div>

                                    {editOpen.position && (
                                        <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-md">
                                            {positionOptions.map((position) => {
                                                return (
                                                    <button
                                                        key={position}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleChange("position", position);
                                                            handleToggleSelct("position", false);
                                                        }}
                                                        className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                                    >
                                                        {position}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-gray-500 font-semibold">
                                    권한
                                    <span className="text-red-500"> *</span>
                                </label>
                                <div
                                    onClick={() => handleToggleSelct("role")}
                                    className="relative rounded-md px-4 py-1 border border-gray-200"
                                >
                                    <div className="flex gap-2 items-center">
                                        <span>{form.role}</span>
                                        {editOpen.role ? (<ChevronRight size={18} className="absolute right-5" />) : (<ChevronDown size={18} className="absolute right-5" />)}
                                    </div>

                                    {editOpen.role && (
                                        <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-md">
                                            {userRoleField.map((role) => {
                                                return (
                                                    <button
                                                        key={role.role}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleChange("role", role.role);
                                                            handleToggleSelct("role", false);
                                                        }}
                                                        className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                                    >
                                                        {role.role}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-[1px] w-full bg-gray-100 my-5" />

                            <p className="text-base font-semibold">
                                추가 정보
                            </p>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-gray-500 font-semibold">전화번호</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={form.tel ?? ""}
                                    placeholder="전화번호를 입력하세요."
                                    onChange={(e) => handleTelChange(e.target.value)}
                                    className="outline-none border border-gray-200 rounded-md px-4 py-2"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-gray-500 font-semibold">상태메세지</label>
                                <input
                                    type="text"
                                    value={form.statusMsg ?? ""}
                                    placeholder="상태메세지를 입력하세요."
                                    onChange={(e) => handleChange("statusMsg", e.target.value)}
                                    className="outline-none border border-gray-200 rounded-md px-4 py-2"
                                />
                            </div>

                            <div className="flex justify-between">
                                <label className="text-sm text-gray-500 font-semibold">이달의 우수사원</label>
                                <button
                                    type="button"
                                    onClick={handleBestWorker}
                                    className={`relative h-6 w-11 rounded-full transition-color ${form.bestWorker ? "bg-violet-500" : "bg-gray-300"}`}
                                >
                                    <span className={`absolute h-4 w-4 left-1 top-1 rounded-full bg-white transition-transform ${form.bestWorker ? "translate-x-5" : "translate-x-0"}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-100 my-5" />

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-md border border-gray-200 px-8 py-2 cursor-pointer hover:bg-gray-100">
                            취소
                        </button>
                        <button
                            onClick={handleSumbmit}
                            className="rounded-md bg-violet-500 text-white px-8 py-2 cursor-pointer hover:bg-violet-400">
                            저장
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}