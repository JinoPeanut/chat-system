
export type UserStatus = "online" | "offline" | "AFK";
export type RoomType = "personal" | "group";

export type User = {
    id: string, // 유저 아이디
    name: string, // 이름
    department: string, // 부서
    position: string, // 직급
    status: UserStatus, // 접속 상태
    profilePic: string | null, // 프로필 사진
}

export type Message = {
    id: string, // 메세지 아이디
    senderId: string, // 보낸 사람
    chatRoomId: string, // 방 아이디
    content: string, // 내용
    timeAt: Date, // 시간
}

export type Chat = {
    id: string, // 방 아이디
    room: RoomType, // 방 타입
    members: User[] | null, // 방 참여자
    messages: Message[] | null, // 메세지들
}

export const USERS: Record<string, User> = {
    user1: {
        id: "user-1",
        name: "홍길동",
        department: "dept-1",
        position: "사원",
        status: "online",
        profilePic: null,
    },

    user2: {
        id: "user-2",
        name: "김철수",
        department: "dept-1",
        position: "주임",
        status: "offline",
        profilePic: null,
    },

    user3: {
        id: "user-3",
        name: "이유리",
        department: "manage-1",
        position: "대리",
        status: "AFK",
        profilePic: null,
    },
}

export const MESSAGE: Record<string, Message> = {
    info1: {
        id: "message-1",
        senderId: "user-3",
        chatRoomId: "personal-2",
        content: "안녕하세요 이유리 입니다.",
        timeAt: new Date(),
    },
    info2: {
        id: "message-2",
        senderId: "user-1",
        chatRoomId: "personal-2",
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
    },

    room2: {
        id: "personal-1",
        room: "personal",
        members: [USERS.user1, USERS.user2],
        messages: [MESSAGE.info1, MESSAGE.info2],
    },

    room3: {
        id: "personal-2",
        room: "personal",
        members: [USERS.user1, USERS.user3],
        messages: [MESSAGE.info1, MESSAGE.info2],
    }
}