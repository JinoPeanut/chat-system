"use client"

import { use, useEffect, useState } from "react"
import { Chat } from "@/types/chat"
import { getStatusColor } from "@/components/chat/SideBar";
import MessageList from "./_components/MessageList";
import MessageInput from "./_components/MessageInput";
import { HomeResponse } from "@/types/notice";

function getUserStatus(status: string) {
    if (status === "online") return "온라인";
    if (status === "offline") return "오프라인";
    if (status === "AFK") return "자리비움"
}

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);
    const [headerMessage, setHeaderMessage] = useState(false);
    const [chatRooms, setChatRooms] = useState<Chat[]>([]);

    const fetchHomeData = async () => {
        const res = await fetch("/api/home");
        const data: HomeResponse = await res.json();
        setChatRooms(data.chatRooms);
    };

    useEffect(() => {
        fetchHomeData();
    }, [])

    const myUserId = "user-1";

    const room = chatRooms.find((room) => room.id === roomId);
    const members = room?.members ?? [];
    const myUser = members.find((member) => member.id === myUserId);
    const user = room?.members?.find((member) => member.id !== myUserId);
    const messages = room?.messages ?? [];

    return (
        <div className="bg-gray-200 min-h-screen flex flex-col">
            {/* 상대방 프로필 표시 */}
            <div className="flex p-4">
                <div className="rounded-full bg-gray-400 w-[50px] h-[50px]">사진</div>
                <div className="flex flex-col pl-2">
                    <span>{user?.name}</span>
                    <div className="flex items-center gap-1">
                        <div className={`rounded-full w-[8px] h-[8px] ${user && getStatusColor(user.status)}`}></div>
                        <span>{user && getUserStatus(user.status)}</span>
                    </div>
                </div>
            </div>

            {/* 최상단 경계선 */}
            <div className="border-b border-gray-400 w-[100%]"></div>

            {/* 고정메세지 */}
            {headerMessage && "상단 메세지 입니다"}

            {/* 채팅메시지 영역 */}
            <div className="flex-1 overflow-auto">
                <MessageList
                    messages={messages}
                    myUser={myUser}
                    user={user}
                    room={room}
                />
            </div>

            {/* 채팅입력 영역 */}
            <div className="shrink-0">
                <MessageInput
                    roomId={roomId}
                    myUserId={myUserId}
                    onSend={fetchHomeData}
                />
            </div>
        </div>
    )
}