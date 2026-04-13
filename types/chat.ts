
export type UserStatus = "online" | "offline" | "AFK";
export type RoomType = "personal" | "group";

export type User = {
    readonly id: string, // 유저 아이디
    readonly name: string, // 이름
    readonly department: string, // 부서
    readonly status: UserStatus, // 접속 상태
}

export type Message = {
    readonly id: string | null, // 메세지 아이디
    readonly send: string | null, // 보낸 사람
    readonly content: string | null, // 내용
    readonly time: Date | null, // 시간
}

export type Chat = {
    readonly id: string | null, // 방 아이디
    readonly room: RoomType | null, // 방 타입
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
        id: "user-2",
        name: "이유리",
        department: "manage-1",
        status: "AFK",
    },
}

export const MESSAGE: Record<string, Message> = {
    info: {
        id: null,
        send: null,
        content: "없음",
        time: null,
    }
}

export const CHATROOM: Record<string, Chat> = {
    room1: {
        id: null,
        room: "group",
        members: null,
        messages: null,
    }
}