"use client"

import { Home, MessageCircleMore, Newspaper, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore";

export default function SideBar() {
    const authUser = useAuthStore((state) => state.user);
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

                    {/* 관리자 버튼 */}
                    {authUser?.role === "ADMIN" && (
                        <button
                            onClick={() => router.push("/admin")}
                            className="rounded-lg border-gray-300 w-[50px] h-[50px] cursor-pointer
                            inline-flex justify-center items-center hover:bg-gray-400 mr-2"
                        >
                            <Shield />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
