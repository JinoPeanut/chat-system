"use client"

import { useAuthStore } from "@/stores/useAuthStore";
import { RecentChat } from "@/types/chat"
import Link from "next/link";

type RecentChatsPanelProps = {
    recentChat: RecentChat[],
}

export default function RecentChatsPanel({ recentChat }: RecentChatsPanelProps) {
    const authUser = useAuthStore((state) => state.user);
    const myUserId = authUser?.id;

    const recentChats = recentChat
        .map((room) => {
            const partner = room.members?.find((m) => m.id !== myUserId);
            const lastMessage = room.messages?.[0];
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
                lastTimeStamp: lastMessage ? new Date(lastMessage.timeAt).getTime() : 0,
            }
        })
        .sort((a, b) => (b.lastTimeStamp - a.lastTimeStamp))
        .slice(0, 3);

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
                            href={`/chat/${chat.roomId}`}
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

