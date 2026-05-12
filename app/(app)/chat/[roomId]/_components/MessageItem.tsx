import { Message } from "@/types/chat"
import { User2 } from "lucide-react"


type MessageItemProps = {
    message: Message
    isMine: boolean
}

export default function MessageItem({ message, isMine }: MessageItemProps) {

    const sender = message.sender;

    const formatMessageTime = (timeAt: string) => {
        const date = new Date(timeAt);
        const now = new Date();

        const isToday = date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();

        if (isToday) {
            return date.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        }

        const yesterDay = new Date();
        yesterDay.setDate(now.getDate() - 1);

        const isYesterday = date.getFullYear() === yesterDay.getFullYear() &&
            date.getMonth() === yesterDay.getMonth() &&
            date.getDate() === yesterDay.getDate();

        if (isYesterday) {
            return `어제 ${date.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })}`;
        }

        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    return (
        <div className={`flex flex-col px-2 py-2 ${isMine ? "items-end" : "items-start"}`}>
            <div className={`flex p-2 gap-1 rounded-md shadow-md mb-2 
                ${isMine ? "bg-gradient-to-br from-violet-300 to-violet-400 border border-violet-300" : "bg-[#ECE9F3] border border-gray-300"}`}>

                {/* 프로필 표시 */}
                {isMine
                    ? <></>
                    : (
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
                    )
                }

                <div className="flex flex-col">

                    {/* 이름 표시 */}
                    {isMine
                        ? (<></>)
                        : <div className="flex gap-2 items-end justify-start pl-3 font-semibold">
                            <p>{sender?.name}</p>
                        </div>
                    }

                    {/* 메세지내용 표시 */}
                    {isMine
                        ? (<div className="flex items-center justify-end gap-1 font-medium pl-2 pr-2">
                            {message.content}
                        </div>)
                        : (<div className="flex items-center justify-start gap-1 font-medium pl-3 pr-5">
                            {message.content}
                        </div>)
                    }
                </div>
            </div>
            {isMine
                ? (<div className="pr-2">
                    <p className="text-sm text-gray-700/50 font-normal">
                        {formatMessageTime(message.timeAt)}
                    </p>
                </div>)
                : (<div className="pl-2">
                    <p className="text-sm text-gray-700/50 font-normal">
                        {formatMessageTime(message.timeAt)}
                    </p>
                </div>)
            }
        </div>
    )
}