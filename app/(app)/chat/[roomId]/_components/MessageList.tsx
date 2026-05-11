import { Chat, Message, User } from "@/types/chat";
import MessageItem from "./MessageItem";

type MessageListProps = {
    messages: Message[];
    myUser?: User;
    otherUser?: User;
    room?: Chat | null;
}

export default function MessageList({ messages, myUser, otherUser, room }: MessageListProps) {

    if (!room || !myUser) {
        return (
            <div>로딩중...</div>
        )
    } else
        return (
            <div>
                {messages.length === 0
                    ? (<div>대화를 시작하세요.</div>)
                    : messages.map((msg) => <MessageItem
                        key={msg.id}
                        message={msg}
                        isMine={msg.senderId === myUser?.id}
                        otherUser={otherUser}
                        myUser={myUser}
                    />)
                }
            </div>
        )
}