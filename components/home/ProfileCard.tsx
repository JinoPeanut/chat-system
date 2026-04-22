"use client"

import { Briefcase, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Profile } from "@/types/profile"

const getStatusWork = (work: string) => {
    if (work === "office") return "사무실";
    if (work === "house") return "재택근무";
    return work;
}

export default function ProfileCard() {

    const myUserId = "user-1";
    const [profile, setProfile] = useState<Profile[]>([]);

    const fetchProfileData = async () => {
        const res = await fetch("/api/profile");
        const data: Profile[] = await res.json();
        setProfile(data);
    }

    const myProfile = profile.find((p) => p.userId === myUserId);

    const profile_position = myProfile ? myProfile.profileUser.position : "알 수 없음";
    const profile_department = myProfile ? myProfile.profileUser.department : "알 수 없음";

    useEffect(() => {
        fetchProfileData();
    }, [])

    return (
        <div className="
                border border-gray-300 rounded-xl mb-4
                shadow-lg min-h-[45%] pb-2 overflow-hidden
            ">
            {/* 설정 */}
            <div className="
                flex justify-end bg-purple-300 px-2 py-4"
            >
                <Settings size={18} className="cursor-pointer hover:text-gray-200" />
            </div>

            <div className="px-2">
                {/* 프로필 영역 */}
                <div className="flex flex-col items-center mt-2 mb-4 relative">
                    <img
                        alt="사진"
                        className="absolute w-[4rem] h-[4rem] bg-gray-400 rounded-full
                        top-[-40px] ring-3 ring-white/50"
                    />
                    <div className="flex gap-1 font-bold items-center mt-8 tracking-tight">
                        <p>{myProfile?.profileUser.name}</p>
                        <p className="w-[3px] h-[3px] rounded-full bg-black"></p>
                        <p>{profile_position}</p>
                    </div>
                    <p className="text-sm text-gray-400 leading-tight font-bold">
                        {profile_department}
                    </p>
                </div>

                {/* 경계선 */}
                <div className="border-gray-200 border-[0.2] mx-2"></div>

                {/* 상태 메세지 */}
                <div className="py-2 flex flex-col justify-center items-center gap-2">
                    <p className="text-sm text-gray-500 leading-tight font-bold">
                        {myProfile?.statusMsg}
                    </p>
                    <div className="flex items-center gap-1 bg-gray-800/80 px-4 py-2 rounded-lg">
                        <div className="w-[1rem] h-[1rem] bg-purple-400 rounded-md" />
                        <span className="text-sm text-gray-300 leading-tight font-bold">
                            {getStatusWork(myProfile ? myProfile?.statusWork : "알 수 없음")}
                        </span>
                    </div>
                </div>

                {/* 이달의 우수사원 이모지 */}
                <div className="flex justify-center items-center mb-2">
                    <p className="text-sm bg-violet-400 px-4 py-2 rounded-lg font-bold text-yellow-200">
                        {myProfile?.bestWorker ? "🏆 이달의 우수사원" : ""}
                    </p>
                </div>

                {/* 경계선 */}
                <div className="border-gray-200 border-[0.2] mx-2"></div>

                {/* 기타 정보 */}
                <div className="flex justify-between mx-2">
                    <div className="flex flex-col gap-1 text-gray-500 font-semibold text-sm mt-3">
                        <p>부서</p>
                        <p>직급</p>
                        <p>휴대폰 번호</p>

                    </div>
                    <div className="flex flex-col gap-1 font-semibold text-sm mt-3 text-right">
                        <p>{profile_department}</p>
                        <p>{profile_position}</p>
                        <p>{myProfile?.tel}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}