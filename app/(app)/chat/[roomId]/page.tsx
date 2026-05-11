"use client"

import { use, useEffect, useState } from "react"
import { Chat } from "@/types/chat"
import { getStatusColor } from "@/components/chat/SideBar";
import MessageList from "./_components/MessageList";
import MessageInput from "./_components/MessageInput";
import { HomeResponse } from "@/types/notice";
import { useAuthStore } from "@/stores/useAuthStore";
import { User2 } from "lucide-react";

function getUserStatus(status: string) {
    if (status === "online") return "온라인";
    if (status === "offline") return "오프라인";
    if (status === "AFK") return "자리비움"
}

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);

    const [headerMessage, setHeaderMessage] = useState(false);
    const authUser = useAuthStore((state) => state.user);
    const [chatRoom, setChatRoom] = useState<Chat | null>(null);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchChatRoom = async () => {
        if (isSubmitting) return;
        setSubmitError("");
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/chatrooms/${roomId}`);

            if (!res.ok) {
                if (res.status === 401) {
                    setSubmitError("로그인이 필요합니다.");
                } else if (res.status === 404) {
                    setSubmitError("접근할 수 없는 채팅방입니다.");
                }
                return
            }

            const data = await res.json();

            setChatRoom(data);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchChatRoom();
    }, [])

    const myUserId = authUser?.id ?? null;

    const members = chatRoom?.members ?? [];
    const myUser = members.find((member) => member.id === myUserId);
    const otherUser = chatRoom?.members?.find((member) => member.id !== myUserId);
    const messages = chatRoom?.messages ?? [];

    return (
        <div className="bg-gray-200 min-h-screen flex flex-col">
            {/* 상대방 프로필 표시 */}
            <div className="flex p-4">
                <div className="rounded-full bg-gray-400 w-[50px] h-[50px]  ">
                    {otherUser?.profilePic
                        ? (<img
                            src={otherUser.profilePic}
                            alt={`${otherUser.name}의 프로필`}
                            className="w-full h-full rounded-full object-cover"
                        />)
                        : (<div className="flex h-[50px] w-[50px] items-center justify-center rounded-full">
                            <User2 className={`w-[50px] h-[50px] bg-gray-100 rounded-full text-slate-400
                                    ring-3`} />
                        </div>
                        )
                    }
                </div>
                <div className="flex flex-col pl-2">
                    <span>{otherUser?.name}</span>
                    <div className="flex items-center gap-1">
                        <div className={`rounded-full w-[8px] h-[8px] ${otherUser && getStatusColor(otherUser.status)}`}></div>
                        <span>{otherUser && getUserStatus(otherUser.status)}</span>
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
                    myUserId={myUserId}
                    room={chatRoom}
                />
            </div>

            {/* 채팅입력 영역 */}
            <div className="shrink-0">
                <MessageInput
                    roomId={roomId}
                    onSend={fetchChatRoom}
                />
            </div>
        </div>
    )
}