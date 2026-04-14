import { Message, MESSAGE, User } from "@/types/chat";
import MessageItem from "./MessageItem";

type MessageListProps = {
    messages: Message[];
    myUser: User;
    user?: User;
}

export default function MessageList({ messages, myUser, user }: MessageListProps) {

    return (
        <div>
            {messages.length === 0
                ? (<div>대화를 시작하세요.</div>)
                : messages.map((msg) => <MessageItem
                    key={msg.id}
                    message={msg}
                    isMine={msg.send === myUser.id}
                    user={user}
                    myUser={myUser}
                />)
            }
        </div>
    )
}