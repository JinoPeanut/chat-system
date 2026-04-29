"use client"

import { useState, useEffect } from "react";
import { ChevronRight, Settings, MessageCircle, Home } from "lucide-react"
import { Chat, UserStatus } from "@/types/chat";
import { useRouter } from "next/navigation"
import { Department } from "@/types/department";
import { HomeResponse } from "@/types/notice";

export function getStatusColor(status: UserStatus) {
    switch (status) {
        case "online": return "bg-green-400"
        case "offline": return "bg-gray-400"
        case "AFK": return "bg-yellow-400"
    }
}

export function getStatusText(status: UserStatus) {
    switch (status) {
        case "online": return "온라인"
        case "offline": return "오프라인"
        case "AFK": return "자리비움"
    }
}

export default function SideBar() {

    const [openDepts, setOpenDepts] = useState<string[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [chatRooms, setChatRooms] = useState<Chat[]>([]);
    const router = useRouter();

    const myUserId = "user-1";
    const myUser = departments.flatMap((dept) => dept.members).find((user) => user.id === myUserId);

    useEffect(() => {
        const fetchData = async () => {
            const deptRes = await fetch("/api/departments");
            const deptData = await deptRes.json();
            setDepartments(deptData);

            // 채팅창 정보가 필요해서 추가
            const homeRes = await fetch("/api/home");
            const homeData: HomeResponse = await homeRes.json();
            setChatRooms(homeData.chatRooms);
        };

        fetchData();
    }, [])

    const handleOpenChat = (targetUserId: string) => {
        const room = chatRooms.find((room) =>
            room.room === "personal" &&
            room.members?.some((member) => member.id === myUserId) &&
            room.members?.some((member) => member.id === targetUserId)
        );

        if (!room) return;

        router.push(`/chat/${room.id}`);
    }

    return (
        <div className="flex w-1/5 min-h-screen bg-purple-300 rounded-l-lg">
            {/* 왼쪽 프로필칸 */}
            <div className="p-4 flex">
                {/* 메인홈 버튼 */}
                <button
                    onClick={() => router.push("/")}
                    className="
                        rounded-lg border-gray-300 w-[50px] h-[50px] cursor-pointer
                        inline-flex justify-center items-center hover:bg-gray-400 mr-2
                ">
                    <Home />
                </button>
            </div>

            <div className="border-r border-gray-400"></div>

            {/* 오른쪽 채팅목록 */}
            <div className="w-full">
                {/* 내 프로필 */}
                <div className="flex p-4 justify-between items-center">
                    {/* 사진 */}
                    <div className="flex">
                        <div className="rounded-full bg-gray-400 w-[50px] h-[50px] ring-2 ring-white/50">
                            사진
                        </div>
                        <div className="justify-between">
                            <div className="pl-2">
                                {myUser?.name}
                                <div className="flex gap-1 items-center">
                                    <div className={`rounded-full w-[8px] h-[8px] ${myUser ? getStatusColor(myUser.status) : "bg-gray-400"}`}></div>
                                    {myUser ? getStatusText(myUser.status) : "오프라인"}
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
                    {departments.map((dept) => {
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
                                        <div className="flex gap-1 items-end">
                                            <span className="font-bold text-medium">{user.name}</span>
                                            <span className="text-xs font-bold text-gray-700 pb-[3px]">{user.position}</span>
                                        </div>
                                        <div className="
                                            invisible group-hover:visible flex gap-1 ml-auto
                                        ">
                                            <MessageCircle
                                                size={16}
                                                className="hover:text-gray-200 cursor-pointer"
                                                onClick={() => handleOpenChat(user.id)}
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