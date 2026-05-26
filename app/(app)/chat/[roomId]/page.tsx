"use client"

import { use, useEffect, useRef, useState } from "react"
import { Chat } from "@/types/chat"
import MessageList from "./_components/MessageList";
import MessageInput from "./_components/MessageInput";
import { useAuthStore } from "@/stores/useAuthStore";
import { User2 } from "lucide-react";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { Department } from "@/types/department";
import { getStatusColor } from "@/utils/statusUtils";

function getUserStatus(status: string) {
    if (status === "online") return "온라인";
    if (status === "offline") return "오프라인";
    if (status === "AFK") return "자리비움"
}

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);

    const router = useRouter();
    const [headerMessage, setHeaderMessage] = useState(false);
    const authUser = useAuthStore((state) => state.user);
    const clearUser = useAuthStore((state) => state.clearUser);

    const [departments, setDepartments] = useState<Department[]>([]);
    const [chatRoom, setChatRoom] = useState<Chat | null>(null);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    const myUserId = authUser?.id ?? null;

    const otherUser = chatRoom?.members?.find((member) => member.id !== myUserId);
    const messages = chatRoom?.messages ?? [];

    const firstMessage = messages[0];

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

    useEffect(() => {
        socket.connect();

        const handleConnect = () => {
            socket.emit("join-room", roomId);
        }

        const handleSocketError = (message: string) => {
            setSubmitError(message);
        }

        if (socket.connected) handleConnect();

        socket.on("connect", handleConnect);

        socket.on("error-message", handleSocketError);

        socket.on("new-message", (message) => {
            setChatRoom((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    messages: [...(prev.messages ?? []), message],
                }
            })
        })

        return () => {
            socket.off("connect", handleConnect);
            socket.off("error-message", handleSocketError);
            socket.off("new-message");
            socket.disconnect();
        }
    }, [roomId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages.length])

    return (
        <div className="min-h-0 h-full flex flex-col bg-[#F5F2FA]">
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
            <div className="border-b-[2px] border-[#DDD6E8] w-[100%]"></div>

            {/* 고정메세지 */}
            {headerMessage && "상단 메세지 입니다"}

            {/* 채팅메시지 영역 */}
            <div className="min-h-0 flex-1 overflow-y-auto">
                <MessageList
                    messages={messages}
                    myUserId={myUserId}
                    room={chatRoom}
                />
                <div ref={bottomRef} />
            </div>

            {/* 오류메세지 */}
            <div className="shrink-0">
                {submitError
                    && (
                        <div className="mx-4 my-2 rounded-md bg-red-100 px-3 py-2 text-sm text-red-600">
                            {submitError}
                        </div>
                    )
                }
            </div>

            {/* 채팅입력 영역 */}
            <div className="shrink-0">
                <MessageInput
                    roomId={roomId}
                    onError={setSubmitError}
                />
            </div>
        </div>
    )
}
