
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
    timeAt: string, // 시간
}

export type Chat = {
    id: string, // 방 아이디
    room: RoomType, // 방 타입
    members: User[] | null, // 방 참여자
    messages: Message[] | null, // 메세지들
}