import { socket } from "@/lib/socket";
import { Plus, Smile } from "lucide-react"
import { useState } from "react";

type MessageInputProps = {
    roomId: string,
    onError: (message: string) => void;
}

export default function MessageInput({ roomId, onError }: MessageInputProps) {

    const [content, setContent] = useState("");

    const handleSend = async () => {
        if (!content.trim()) return;

        if (!socket.connected) {
            onError("실시간 서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        socket.emit("send-message", {
            chatRoomId: roomId,
            content,
        })

        setContent("");
    }

    return (
        <div className="
            m-2 bg-white/70 border-2 border-gray-300
            h-[60px] rounded-lg px-3
        ">
            <div className="h-full flex items-center gap-2">
                {/* 업로드 버튼 or 그 외 기능 */}
                <button type="button" className="shrink-0 p-1 rounded-md group">
                    <Plus size={30} className="text-gray-400 group-hover:text-gray-600 cursor-pointer" />
                </button>

                <div className="flex items-center gap-2 w-full">
                    {/* 채팅입력칸 */}
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSend();
                            }
                        }}
                        placeholder="메세지를 입력하세요."
                        className="
                            w-full bg-transparent outline-none text-black 
                            placeholder:text-gray-300 flex-1 min-w-0"
                    />

                    {/* 이모지 버튼 */}
                    <button type="button" className="shrink-0 p-1 rounded-md group">
                        <Smile size={30} className="text-gray-400 group-hover:text-gray-600 cursor-pointer" />
                    </button>
                </div>
            </div>
        </div>
    )
}