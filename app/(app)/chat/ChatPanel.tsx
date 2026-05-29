"use client";

import ProfileAvatar from "@/components/common/ProfileAvatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Chat } from "@/types/chat";
import { Department } from "@/types/department";
import { HomeResponse } from "@/types/home";
import { getStatusColor, getStatusText } from "@/utils/statusUtils";
import { ChevronRight, MessageCircle, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatPanel() {
    const router = useRouter();

    const authUser = useAuthStore((state) => state.user);
    const clearUser = useAuthStore((state) => state.clearUser);
    const myDepartment = authUser?.department;
    const myUserId = authUser?.id ?? null;

    const [departments, setDepartments] = useState<Department[]>([]);
    const [openDepts, setOpenDepts] = useState<string[]>([]);
    const [chatRooms, setChatRooms] = useState<Chat[]>([]);
    const [keyword, setKeyword] = useState("");

    const isSearching = keyword.trim().length > 0;

    const logout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST"
        });
        clearUser();
        router.push("/");
    };

    // 채팅방 이동
    const handleOpenChat = async (targetUserId: string) => {
        const res = await fetch("/api/chatrooms/personal", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ targetUserId }),
        });

        if (!res.ok) return;

        const data = await res.json();

        router.push(`/chat/${data.room.id}`);
    }

    // 부서목록 인원 표시 + 검색
    const fetchData = async () => {
        const params = new URLSearchParams();

        if (keyword.trim()) {
            params.set("keyword", keyword.trim());
        }

        const url = params.toString()
            ? `/api/departments?${params.toString()}`
            : `/api/departments`;

        const deptRes = await fetch(url);
        const deptData = await deptRes.json();
        setDepartments(deptData);

        // 채팅창 정보가 필요해서 추가
        const homeRes = await fetch("/api/home");
        const homeData: HomeResponse = await homeRes.json();
        setChatRooms(homeData.recentChat);
    };

    useEffect(() => {
        fetchData();
    }, [keyword])

    return (
        <>
            {/* 사이드바 오른쪽 - 채팅목록 */}
            <div className="w-[250px] shrink-0 min-h-screen flex flex-col rounded-l-lg bg-[#F5F2FA] border-r-[2px] border-[#DDD6E8]">
                {/* 내 프로필 */}
                <div className="flex p-4 justify-between items-center">
                    {/* 사진 */}
                    <div className="flex">

                        <ProfileAvatar
                            src={authUser?.profilePic}
                            alt="프로필 사진"
                            size={50}
                            status={authUser?.status}
                        />

                        <div className="justify-between">
                            <div className="pl-2">
                                <span>{authUser?.name}</span>
                                <span className="text-xs text-gray-500">{myDepartment}</span>
                                <div className="flex gap-1 items-center">
                                    <div className={`rounded-full w-[8px] h-[8px] ${authUser ? getStatusColor(authUser.status) : "bg-gray-400"}`}></div>
                                    {authUser ? getStatusText(authUser.status) : "오프라인"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Settings size={18} className="hover:text-gray-200 cursor-pointer" />
                </div>

                {/* 경계선 */}
                <div className="border-[0.5px] border-[#DDD6E8] w-[100%]"></div>

                <div className="flex items-center justify-center mt-5">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="사원 검색"
                        className="border border-gray-300 rounded-full px-4 py-2"
                    />
                </div>

                {/* 부서 목록 */}
                <div className="p-4">
                    {departments.map((dept) => {
                        return (
                            <div key={dept.id} className="mb-2">
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
                                        text-gray-700 text-bold text-sm gap-1
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
                                {(isSearching || openDepts.includes(dept.id)) && dept.members?.filter((member) => member.id !== myUserId).map((user) => (
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

                <div className="mt-auto p-4 mx-auto">
                    <button
                        onClick={logout}
                        className="bg-gray-200 px-4 py-2 rounded-md hover:bg-red-500 cursor-pointer"
                    >
                        로그아웃
                    </button>
                </div>
            </div>
        </>
    )
}