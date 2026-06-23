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

// 게시글 목록 GET 전용 타입
export type Notice = {
    id: string;
    title: string;
    category: NoticeCategory;   // 제목 앞 [태그] 용
    isPinned?: boolean;         // 상단 고정 필요하면
    createdAt: string;          // 만든 시간

    author: {
        name: string,
        profilePic: string,
        position: string,
    }
};

// 관리자 게시글관리 목록 GET 전용 타입
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