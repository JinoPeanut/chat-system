"use client"

import { use, useState } from "react"
import { MESSAGE, USERS } from "@/types/chat"
import { getStatusColor } from "@/components/chat/SideBar";
import MessageList from "./_components/MessageList";
import MessageInput from "./_components/MessageInput";

function getUserStatus(status: string) {
    if (status === "online") return "온라인";
    if (status === "offline") return "오프라인";
    if (status === "AFK") return "자리비움"
}

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
    const [headerMessage, setHeaderMessage] = useState(false);

    const { roomId } = use(params);
    const user = Object.values(USERS).find((u) => u.id === roomId);
    const myUser = USERS.user1;
    const messages = Object.values(MESSAGE);

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
                />
            </div>

            {/* 채팅입력 영역 */}
            <div className="shrink-0">
                <MessageInput />
            </div>
        </div>
    )
}