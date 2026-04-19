import { Message, User } from "@/types/chat"


type MessageItemProps = {
    message: Message
    isMine: boolean
    user?: User
    myUser: User,
}

export default function MessageItem({ message, isMine, user, myUser }: MessageItemProps) {
    return (
        <div>
            <div className="flex pl-4 pt-4 p-2 gap-1">
                <div className="rounded-full bg-gray-400 w-[50px] h-[50px]">사진</div>
                <div className="flex flex-col pl-2">
                    <div className="flex gap-2 items-end">
                        <p>{isMine ? myUser.name : user?.name}</p>
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