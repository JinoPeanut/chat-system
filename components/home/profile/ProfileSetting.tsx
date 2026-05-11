"use client"
import { AuthUser } from "@/stores/useAuthStore";
import { ProfileWork } from "@/types/profile";
import { Pencil, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const statusWorkValue = [
    { status: "office", text: "사무실" },
    { status: "house", text: "재택근무" }
]

type ProfileSettingProps = {
    isOpen: boolean;
    closeModal: () => void;
    authUser: AuthUser | null;
    form: {
        statusMsg: string,
        statusWork: ProfileWork,
        tel: string,
        profilePic: string | null,
    };
    handleChangeProfileImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onStatusWork: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onStatusMsg: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTel: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
}

export default function ProfileSetting({
    isOpen, closeModal, authUser, form, handleChangeProfileImage, onStatusWork, onStatusMsg, onTel, onSubmit,
}: ProfileSettingProps) {

    const [saveMsg, setSaveMsg] = useState<"edit" | "save">("edit");
    const [saveTel, setSaveTel] = useState<"edit" | "save">("edit");
    const statusMsgInputRef = useRef<HTMLInputElement | null>(null);
    const telInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (saveMsg === "save") {
            statusMsgInputRef.current?.focus();
        }

        if (saveTel === "save") {
            telInputRef.current?.focus();
        }
    }, [saveMsg, saveTel])

    return (
        <>
            {isOpen &&
                (<div
                    onClick={closeModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white px-6 py-4 rounded-md"
                    >
                        {/* 상단 - 프로필 변경 영역*/}
                        <div className="flex items-center justify-center bg-violet-300 py-2 rounded-md">
                            <input
                                id="profile-image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleChangeProfileImage}
                            />
                            <label htmlFor="profile-image" className="group relative block h-20 w-20 cursor-pointer overflow-hidden rounded-full bg-gray-300">
                                {form.profilePic
                                    ? (<img
                                        src={form.profilePic}
                                        alt="프로필 사진"
                                        className="w-full h-full object-cover"
                                    />)
                                    : (
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full">
                                            <User className="h-20 w-20 text-slate-400" />
                                        </div>
                                    )}
                                <div
                                    className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex cursor-pointer">
                                    <Pencil size={20} className="text-white" />
                                </div>
                            </label>
                        </div>

                        {/* 중간 - 근무위치/상태메세지/전화번호 입력 */}
                        <div className="flex flex-col gap-5 mt-5">
                            <div className="flex flex-col gap-1">
                                <label className="font-semibold">근무 위치</label>
                                <p className="text-sm text-gray-500">현재 내 근무 위치를 공유하세요.</p>
                                <select
                                    value={form.statusWork}
                                    onChange={onStatusWork}
                                    className="border border-gray-300 rounded-lg p-2"
                                >
                                    {statusWorkValue.map((work) => {
                                        return (
                                            <option key={work.status} value={work.status}>
                                                {work.text}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>

                            <span className="w-full h-[0.5px] bg-gray-100" />

                            <div className="flex flex-col gap-1">
                                <label>상태 메세지</label>
                                <p className="text-sm text-gray-500">짧은 내용의 상태메세지를 작성하세요.</p>
                                {saveMsg === "save"
                                    ? <>
                                        <div className="relative flex items-center">
                                            <input
                                                ref={statusMsgInputRef}
                                                id="profile-statusMsg"
                                                type="text"
                                                value={form.statusMsg}
                                                onChange={onStatusMsg}
                                                className="w-full border border-gray-300 rounded-lg py-2 pl-2 pr-10"
                                            />
                                            <button
                                                onClick={() => setSaveMsg("edit")}
                                                className="absolute right-[5%] text-xs text-gray-500">
                                                저장
                                            </button>
                                        </div>
                                    </>
                                    : <>
                                        <div className="relative flex items-center">
                                            <p className="w-full border border-gray-400 bg-gray-400 rounded-lg py-2 pl-2 pr-10">
                                                {form.statusMsg}
                                            </p>
                                            <button
                                                onClick={() => setSaveMsg("save")}
                                                className="absolute right-[5%] text-xs text-white">
                                                수정
                                            </button>
                                        </div>
                                    </>
                                }
                            </div>

                            <span className="w-full h-[0.5px] bg-gray-100" />

                            <div className="flex flex-col gap-1">
                                <label>휴대폰 번호</label>
                                <p className="text-sm text-gray-500">사내 인원들과 연락할 수단을 추가 해보세요.</p>

                                {saveTel === "save"
                                    ? <>
                                        <div className="relative flex items-center">
                                            <input
                                                ref={telInputRef}
                                                id="profile-tel"
                                                type="text"
                                                value={form.tel}
                                                onChange={onTel}
                                                placeholder="010-0000-0000"
                                                className="w-full border border-gray-300 rounded-lg py-2 pl-2 pr-10"
                                            />
                                            <button
                                                onClick={() => setSaveTel("edit")}
                                                className="absolute right-[5%] text-xs text-gray-500">
                                                저장
                                            </button>
                                        </div>
                                    </>
                                    : <>
                                        <div className="relative flex items-center">
                                            <p className="w-full border border-gray-400 bg-gray-400 rounded-lg py-2 pl-2 pr-10">
                                                {form.tel}
                                            </p>
                                            <button
                                                onClick={() => setSaveTel("save")}
                                                className="absolute right-[5%] text-xs text-white">
                                                수정
                                            </button>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>

                        {/* 하단 - 취소, 저장버튼 */}
                        <div className="flex items-center justify-center mt-5">
                            <button
                                onClick={onSubmit}
                                className="bg-violet-300 px-4 py-2 rounded-md text-gray-600"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>)}
        </>
    )
}