import { User } from "./chat";

export type NoticeCategory = "notice" | "event" | "update" | "etc";
export type NoticeScope = "all" | "notice" | "event" | "update" | "etc";

export const NOTICE_TABS: { key: NoticeScope; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "notice", label: "공지사항" },
    { key: "event", label: "이벤트" },
    { key: "update", label: "업데이트" },
    { key: "etc", label: "기타" },
];

export type NoticeAttachment = {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number | null;
    fileType?: string | null;
};

export type Notice = {
    id: string;
    category: NoticeCategory;   // 제목 앞 [태그] 용
    title: string;
    content?: string;           // 목록만 우선이면 optional
    authorId: string;           // USERS와 연결
    createdAt: string;          // 만든 시간
    isPinned?: boolean;         // 상단 고정 필요하면
    author?: User;
    attachments?: NoticeAttachment[];
    viewCount: number;
};

export type AdminNotice = {
    id: string,
    title: string,
    category: NoticeCategory,
    isPinned: boolean,
    createdAt: string,
    viewCount: number,
    author: {
        id: string,
        name: string,
        profilePic: string | null,
    }
}