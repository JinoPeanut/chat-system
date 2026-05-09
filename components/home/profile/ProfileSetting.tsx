import { AuthUser } from "@/stores/useAuthStore";
import { CircleUser, CircleUserRound, Pencil, User } from "lucide-react";


type ProfileSettingProps = {
    isOpen: boolean;
    closeModal: () => void;
    authUser: AuthUser | null;
    form: {
        statusMsg: string,
        statusWork: "office" | "house",
        tel: string,
        profilePic: string | null,
    };
    handleChangeProfileImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onStatusWork: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onStatusMsg: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTel: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
}

export default function ProfileSetting({ isOpen, closeModal, authUser, form, handleChangeProfileImage, onStatusWork, onStatusMsg, onTel, onSubmit, }: ProfileSettingProps) {
    return (
        <>
            {isOpen &&
                (<div
                    onClick={closeModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-4 rounded-md"
                    >
                        {/* 상단 - 프로필 변경 영역*/}
                        <div>
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

                        <div className="flex flex-col">
                            <div>
                                <select
                                    value={form.statusWork}
                                    onChange={onStatusWork}
                                >
                                    <option value="office">사무실</option>
                                    <option value="house">재택근무</option>
                                </select>
                            </div>
                            <div>
                                <input
                                    id="profile-statusMsg"
                                    type="text"
                                    value={form.statusMsg}
                                    onChange={onStatusMsg}
                                />
                            </div>
                            <div>
                                <input
                                    id="profile-tel"
                                    type="text"
                                    value={form.tel}
                                    onChange={onTel}
                                    placeholder="010-0000-0000"
                                />
                            </div>
                        </div>

                        {/* 하단 - 취소, 저장버튼 */}
                        <div>
                            <button
                                onClick={onSubmit}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>)}
        </>
    )
}