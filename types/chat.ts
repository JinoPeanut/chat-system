
export type UserStatus = "online" | "offline" | "AFK";
export type RoomType = "personal" | "group";

export type User = {
    readonly id: string, // 유저 아이디
    readonly name: string, // 이름
    readonly department: string, // 부서
    readonly status: UserStatus, // 접속 상태
}

export type Message = {
    readonly id: string, // 메세지 아이디
    readonly send: string, // 보낸 사람
    readonly content: string, // 내용
    readonly timeAt: Date, // 시간
}

export type Chat = {
    readonly id: string, // 방 아이디
    readonly room: RoomType, // 방 타입
    readonly members: User[] | null, // 방 참여자
    readonly messages: Message[] | null, // 메세지들
}

export const USERS: Record<string, User> = {
    user1: {
        id: "user-1",
        name: "홍길동",
        department: "dept-1",
        status: "online",
    },

    user2: {
        id: "user-2",
        name: "김철수",
        department: "dept-1",
        status: "offline",
    },

    user3: {
        id: "user-3",
        name: "이유리",
        department: "manage-1",
        status: "AFK",
    },
}

export const MESSAGE: Record<string, Message> = {
    info1: {
        id: "message-1",
        send: "user-3",
        content: "안녕하세요 이유리 입니다.",
        timeAt: new Date(),
    },
    info2: {
        id: "message-2",
        send: "user-1",
        content: "안녕하세요 홍길동 입니다.",
        timeAt: new Date()
    }
}

export const CHATROOM: Record<string, Chat> = {
    room1: {
        id: "group-1",
        room: "group",
        members: null,
        messages: null,
    }
}