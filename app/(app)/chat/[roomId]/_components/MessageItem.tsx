import { Message, User } from "@/types/chat"
import { User2 } from "lucide-react"


type MessageItemProps = {
    message: Message
    isMine: boolean
}

export default function MessageItem({ message, isMine }: MessageItemProps) {

    const sender = message.sender;

    return (
        <div>
            <div className="flex pl-4 pt-4 p-2 gap-1">
                <div className="rounded-full bg-gray-400 w-[50px] h-[50px]">
                    {sender?.profilePic
                        ? (<img
                            src={sender.profilePic}
                            alt={`${sender.name}의 프로필`}
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
                    <div className="flex gap-2 items-end">
                        <p>{sender?.name}</p>
                        <p className="text-sm text-gray-700/50">
                            {new Date(message.timeAt).toLocaleTimeString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        {message.content}
                    </div>
                </div>
            </div>
        </div>
    )
}