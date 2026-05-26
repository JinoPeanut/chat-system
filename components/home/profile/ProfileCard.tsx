"use client"

import { Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Profile, ProfileForm } from "@/types/profile";
import { useAuthStore } from "@/stores/useAuthStore";
import ProfileSetting from "./ProfileSetting";
import ProfileAvatar from "@/components/common/ProfileAvatar";

const getStatusWork = (work: string) => {
    if (work === "office") return "사무실";
    if (work === "house") return "재택근무";
    return work;
}

export default function ProfileCard() {
    const authUser = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const [form, setForm] = useState<ProfileForm>({
        statusMsg: profile?.statusMsg ?? "",
        statusWork: profile?.statusWork ?? "office",
        tel: profile?.tel ?? "",
        profilePic: authUser?.profilePic ?? null,
    })

    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValidTel = (tel: string) => {
        if (!tel) return true;
        return /^010-\d{4}-\d{4}$/.test(tel);
    }

    const fetchProfileData = async () => {
        const res = await fetch("/api/profile/me");
        if (!res.ok) return;

        const data: Profile | null = await res.json();
        setProfile(data);
    }

    const handleUpdateProfile = async () => {
        if (isSubmitting) return;
        if (!isValidTel(form.tel)) {
            setSubmitError("전화번호 형식이 올바르지 않습니다");
            return;
        }
        setSubmitError("");
        setIsSubmitting(true);

        const res = await fetch("/api/profile/me", {
            method: "PATCH",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(form),
        });

        if (!res.ok) {
            if (res.status === 401) {
                setSubmitError("로그인이 필요합니다");
            } else if (res.status === 400) {
                setSubmitError("근무 상태를 알 수 없습니다");
            } else {
                setSubmitError("프로필 저장에 실패했습니다");
            }
            return false
        }

        const data = await res.json();

        setProfile(data.profile);

        if (authUser) {
            setUser({
                ...authUser,
                profilePic: data.user.profilePic,
            })
        }

        closeModal();
    }

    const handleChange = <k extends keyof ProfileForm>(
        key: k,
        value: ProfileForm[k]
    ) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const authUserName = authUser ? authUser.name : "정보 없음";
    const authUserPosition = authUser ? authUser.position : "정보 없음";
    const authUserDepartment = authUser ? authUser.department : "정보 없음";

    // 선택한 이미지파일 읽는 함수
    const handleChangeProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onloadend = () => {
            handleChange("profilePic", reader.result as string);
        };

        reader.readAsDataURL(file);
    }

    const handleChangeStatusWork = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleChange("statusWork", e.target.value as ProfileForm["statusWork"]);
    }

    const handleChangeStatusMsg = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange("statusMsg", e.target.value as ProfileForm["statusMsg"]);
    }

    const formatTel = (value: string) => {
        const onlyNumber = value.replace(/\D/g, "");

        if (onlyNumber.length <= 3) {
            return onlyNumber;
        }

        if (onlyNumber.length <= 7) {
            return `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3)}`;
        }

        return `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3, 7)}-${onlyNumber.slice(7, 11)}`;
    }

    const handleChangeTel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedTel = formatTel(e.target.value);
        handleChange("tel", formattedTel);
    }

    useEffect(() => {
        fetchProfileData();
    }, [])

    useEffect(() => {
        setForm({
            statusMsg: profile?.statusMsg ?? "",
            statusWork: profile?.statusWork ?? "office",
            tel: profile?.tel ?? "",
            profilePic: authUser?.profilePic ?? null,
        })
    }, [profile, authUser?.profilePic])

    return (
        <div className="
                border border-gray-300 rounded-xl mb-4
                shadow-lg min-h-[45%] pb-2 overflow-hidden
            ">
            <div className="
                flex justify-end bg-purple-300 px-2 py-4"
            >
                <Settings
                    size={18}
                    onClick={openModal}
                    className="cursor-pointer hover:text-gray-200" />
            </div>

            <div className="px-2">
                <div className="flex flex-col items-center mt-2 mb-4 relative">

                    <ProfileAvatar
                        src={authUser?.profilePic}
                        status={authUser?.status}
                        alt="프로필 사진"
                        size={64}
                        absolute="absolute"
                        absoluteStyle="top-[-40px]"
                    />

                    <div className="flex gap-1 font-bold items-center mt-9 tracking-tight">
                        <p>{authUserName}</p>
                        <p className="w-[3px] h-[3px] rounded-full bg-black"></p>
                        <p>{authUserPosition}</p>
                    </div>
                    <p className="text-sm text-gray-400 leading-tight font-bold">
                        {authUserDepartment}
                    </p>
                </div>

                <div className="border-gray-200 border-[0.2] mx-2"></div>

                <div className="py-2 flex flex-col justify-center items-center gap-2">
                    <p className="text-sm text-gray-500 leading-tight font-bold">
                        {profile?.statusMsg ?? "상태 메시지가 없습니다."}
                    </p>
                    <div className="flex items-center gap-1 bg-gray-800/80 px-4 py-2 rounded-lg">
                        <div className="w-[1rem] h-[1rem] bg-purple-400 rounded-md" />
                        <span className="text-sm text-gray-300 leading-tight font-bold">
                            {getStatusWork(profile ? profile.statusWork : "정보 없음")}
                        </span>
                    </div>
                </div>

                <div className="flex justify-center items-center mb-2">
                    <p className="text-sm bg-violet-400 px-4 py-2 rounded-lg font-bold text-yellow-200">
                        {profile?.bestWorker ? "이달의 우수사원" : "화이팅!"}
                    </p>
                </div>

                <div className="border-gray-200 border-[0.2] mx-2"></div>

                <div className="flex justify-between mx-2">
                    <div className="flex flex-col gap-1 text-gray-500 font-semibold text-sm mt-3">
                        <p>부서</p>
                        <p>직급</p>
                        <p>휴대폰 번호</p>
                    </div>
                    <div className="flex flex-col gap-1 font-semibold text-sm mt-3 text-right">
                        <p>{authUserDepartment}</p>
                        <p>{authUserPosition}</p>
                        <p>{profile?.tel ?? "-"}</p>
                    </div>
                </div>
            </div>

            <ProfileSetting
                isOpen={isOpen}
                closeModal={closeModal}
                authUser={authUser}
                form={form}
                handleChangeProfileImage={handleChangeProfileImage}
                onStatusWork={handleChangeStatusWork}
                onStatusMsg={handleChangeStatusMsg}
                onTel={handleChangeTel}
                onSubmit={handleUpdateProfile}
            />
        </div>
    )
}
