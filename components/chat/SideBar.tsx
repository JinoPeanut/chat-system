"use client"

import { Home, MessageCircleMore, Newspaper } from "lucide-react"
import { UserStatus } from "@/types/chat";
import { useRouter } from "next/navigation"

export function getStatusRingColor(status: UserStatus) {
    switch (status) {
        case "online":
            return "ring-green-400";
        case "offline":
            return "ring-gray-400";
        case "AFK":
            return "ring-yellow-400";
    }
}

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

    const router = useRouter();

    return (
        <div className="flex min-h-screen">
            {/* 사이드바 왼쪽 - 아이콘 버튼 */}
            <div className="flex flex-col bg-[#D9B8F3] rounded-lg">
                {/* 왼쪽 프로필칸 */}
                <div className="p-4 flex flex-col gap-5">
                    {/* 메인홈 버튼 */}
                    <button
                        onClick={() => router.push("/home")}
                        className="
                        rounded-lg border-gray-300 w-[50px] h-[50px] cursor-pointer
                        inline-flex justify-center items-center hover:bg-gray-400 mr-2 mb-10
                    ">
                        <Home />
                    </button>

                    {/* 채팅 버튼 */}
                    <button
                        onClick={() => router.push("/chat")}
                        className="
                        rounded-lg border-gray-300 w-[50px] h-[50px] cursor-pointer
                        inline-flex justify-center items-center hover:bg-gray-400 mr-2
                    ">
                        <MessageCircleMore />
                    </button>

                    {/* 게시판 버튼 */}
                    <button
                        onClick={() => router.push("/notice")}
                        className="
                        rounded-lg border-gray-300 w-[50px] h-[50px] cursor-pointer
                        inline-flex justify-center items-center hover:bg-gray-400 mr-2
                    ">
                        <Newspaper />
                    </button>
                </div>
            </div>
        </div>
    )
}
