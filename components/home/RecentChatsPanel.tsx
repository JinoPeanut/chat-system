"use client"

import { useAuthStore } from "@/stores/useAuthStore";
import { Chat } from "@/types/chat"
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RecentChatsPanel() {
    const [chatRooms, setChatRooms] = useState<Chat[]>([]);
    const authUser = useAuthStore((state) => state.user);

    const myUserId = authUser?.id;

    const recentChats = chatRooms
        // 내가 있는 대화방만 필터링
        .filter((room) => room.members?.some((m) => m.id === myUserId))
        .map((room) => {
            const partner = room.members?.find((m) => m.id !== myUserId);
            const lastMessage = room.messages?.[room.messages.length - 1];
            return {
                roomId: room.id,
                partnerId: partner?.id,
                partnerName: partner?.name ?? "-",
                partnerProfilePic: partner?.profilePic ?? null,
                lastContent: lastMessage?.content ?? "메세지가 없습니다",
                lastTime: lastMessage
                    ? new Date(lastMessage.timeAt).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    })
                    : "-",
            }
        })
        .sort((a, b) => (a.lastTime < b.lastTime ? 1 : -1))
        .slice(0, 3);

    useEffect(() => {
        const fetchChatData = async () => {
            const res = await fetch("/api/home/chat");
            const data = await res.json();

            setChatRooms(data);
        }

        fetchChatData();
    }, [])

    return (
        <div className="border border-gray-200 rounded-md
                px-2 pb-4 shadow-lg min-h-[30%] mb-4"
        >
            <div className="mb-2">
                <h3 className="text-sm font-bold pt-3">최근 대화내역</h3>
            </div>
            {/* 최근 대화내역 표시 */}
            <div className="space-y-2">
                {recentChats.length === 0
                    ? (<p className="text-sm text-gray-500 py-4 text-center">최근 대화가 없습니다</p>)
                    : (recentChats.map((chat) => (
                        <Link
                            key={chat.roomId}
                            href={`\/chat/${chat.roomId}`}
                            className="block rounded-md border border-gray-200 p-3 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">{chat.partnerName}</p>
                                <p className="text-xs text-gray-400">{chat.lastTime}</p>
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">{chat.lastContent}</p>
                        </Link>
                    )))
                }
            </div>
        </div>
    )
}

