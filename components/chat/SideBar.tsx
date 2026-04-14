"use client"

import { DEPARTMENT } from "@/types/department"
import { useState } from "react";
import { ChevronRight, Settings, MessageCircle } from "lucide-react"
import { UserStatus } from "@/types/chat";
import { useRouter } from "next/navigation"

export function getStatusColor(status: UserStatus) {
    switch (status) {
        case "online": return "bg-green-400"
        case "offline": return "bg-gray-400"
        case "AFK": return "bg-yellow-400"
    }
}

export default function SideBar() {

    const [openDepts, setOpenDepts] = useState<string[]>([]);
    const router = useRouter();

    return (
        <div className="flex w-1/4 min-h-screen bg-purple-700 rounded-l-lg">
            {/* 왼쪽 프로필칸 */}
            <div className="p-4 flex">
                {/* 메인홈 버튼 */}
                <button className="
                    rounded-lg border-gray-300 bg-gray-500 w-[50px] h-[50px]
                    justify-center items-center hover:bg-gray-400 mr-2
                ">
                    Home
                </button>
            </div>

            <div className="border-r border-gray-400"></div>

            {/* 오른쪽 채팅목록 */}
            <div className="w-full">
                {/* 내 프로필 */}
                <div className="flex p-4 justify-between items-center">
                    {/* 사진 */}
                    <div className="flex">
                        <div className="rounded-full bg-gray-400 w-[50px] h-[50px]">
                            사진
                        </div>
                        <div className="justify-between">
                            <div>
                                {`이름`}
                                <div>
                                    {`(온라인)`}
                                    {`현재상태`}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Settings size={18} className="hover:text-gray-200 cursor-pointer" />
                </div>

                {/* 경계선 */}
                <div className="border-b border-gray-400 w-[100%]"></div>

                {/* 부서 목록 */}
                <div className="p-4">
                    {Object.values(DEPARTMENT).map((dept) => {
                        return (
                            <div key={dept.id}>
                                {/* 부서명 */}
                                <div
                                    onClick={() => {
                                        if (!dept.id) return
                                        setOpenDepts((prev) => prev.includes(dept.id)
                                            ? prev.filter((id) => id !== dept.id)
                                            : [...prev, dept.id]
                                        )
                                    }}
                                    className="
                                        text-gray-700 text-bold text-sm
                                        w-[50%] flex items-center
                                        cursor-pointer transition
                                        hover:text-gray-200 select-none
                                ">
                                    {dept.name}
                                    <ChevronRight
                                        size={14}
                                        className={`
                                                transition-transform duration-300
                                                ${openDepts.includes(dept.id) ? "rotate-90" : ""}`}
                                    />
                                </div>

                                {/* 부서 인원 목록 */}
                                {openDepts.includes(dept.id) && dept.members?.map((user) => (
                                    <div
                                        key={user.id}
                                        className="
                                            flex items-center gap-2 px-3 py-0.5 group
                                            hover:rounded-md hover:bg-gray-700/30
                                    ">
                                        <div className={` rounded-full w-[8px] h-[8px] ${getStatusColor(user.status)}`}></div>
                                        <span className="text-xl ">{user.name}</span>
                                        <div className="
                                            invisible group-hover:visible flex gap-1 ml-auto
                                        ">
                                            <MessageCircle
                                                size={16}
                                                className="hover:text-gray-200 cursor-pointer"
                                                onClick={() => router.push(`/chat/${user.id}`)}
                                            />
                                            <Settings size={16} className="hover:text-gray-200 cursor-pointer" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}