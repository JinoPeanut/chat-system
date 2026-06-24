import { Chat, Message } from "@/types/chat";
import MessageItem from "./MessageItem";

type MessageListProps = {
    messages: Message[];
    myUserId: string | null;
    room?: Chat | null;
}

const getDateKey = (timeAt: string) => {
    const date = new Date(timeAt);

    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

const formatDateLabel = (timeAt: string) => {
    return new Date(timeAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    })
}

export default function MessageList({ messages, myUserId, room }: MessageListProps) {

    if (!room) {
        return (
            <div>로딩중...</div>
        )
    } else
        return (
            <div>
                {messages.length === 0
                    ? (<div>대화를 시작하세요.</div>)
                    : messages.map((msg, index) => {
                        const prevMessage = messages[index - 1];

                        const showDateDivider =
                            index === 0 || getDateKey(msg.timeAt) !== getDateKey(prevMessage.timeAt);

                        return (
                            <div key={msg.id}>
                                {showDateDivider && (
                                    <div className="my-6 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-gray-400">
                                            {formatDateLabel(msg.timeAt)}
                                        </span>
                                    </div>
                                )}

                                <MessageItem
                                    message={msg}
                                    isMine={msg.senderId === myUserId}
                                />
                            </div>
                        )
                    })
                }
            </div>
        )
}