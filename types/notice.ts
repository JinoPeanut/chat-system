import { Chat, User } from "./chat";

export type NoticeCategory = "notice" | "event" | "update" | "etc";
export type NoticeScope = "all" | "notice" | "event" | "update" | "etc";

export const NOTICE_TABS: { key: NoticeScope; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "notice", label: "공지사항" },
    { key: "event", label: "이벤트" },
    { key: "update", label: "업데이트" },
    { key: "etc", label: "기타" },
];

export type NoticeState = {
    byId: Record<string, Notice>,
    allIds: string[],
}

export type Notice = {
    id: string;
    category: NoticeCategory;   // 제목 앞 [태그] 용
    title: string;
    content?: string;           // 목록만 우선이면 optional
    authorId: string;           // USERS와 연결
    createdAt: string;          // 만든 시간
    isPinned?: boolean;         // 상단 고정 필요하면
    author?: User;
};

export type HomeResponse = {
    users: User[];
    chatRooms: Chat[];
    notices: Notice[];
};

export const NOTICE: NoticeState = {
    byId: {
        n1: {
            id: "n1",
            category: "notice",
            title: "근로자의 날 휴무 안내",
            content: "5월 1일은 전사 휴무입니다.",
            authorId: "user-3",
            createdAt: "2026-04-18T09:00:00.000Z",
            isPinned: true,
        },
        n2: {
            id: "n2",
            category: "event",
            title: "사내 워크샵 참가 신청",
            authorId: "user-2",
            createdAt: "2026-04-17T03:30:00.000Z",
        },
        n3: {
            id: "n3",
            category: "update",
            title: "채팅 시스템 업데이트 v1.2",
            authorId: "user-1",
            createdAt: "2026-04-16T11:20:00.000Z",
        },
    },
    allIds: ["n1", "n2", "n3"], // 화면 표시 순서
};