"use client";

import { getCategoryName } from "@/components/home/notice/HomeNoticePanel";
import { usePagination } from "@/hooks/notice/usePagination";
import { Notice, NOTICE_TABS, NoticeScope } from "@/types/notice";
import { Loader2, PinIcon, Search, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const getCategoryStyle = (category: string) => {
    if (category === "notice") return "bg-violet-100 text-violet-600"
    if (category === "event") return "bg-emerald-100 text-emerald-600"
    if (category === "update") return "bg-indigo-100 text-indigo-600"
    if (category === "etc") return "bg-amber-100 text-amber-600"
}

export default function MainNoticePanel() {
    const LIMIT = 7;
    const [activeTab, setActiveTab] = useState<NoticeScope>("all");
    const [notices, setNotices] = useState<Notice[]>([]);
    const [keyword, setKeyword] = useState("");
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const { page, setPage, nextPage, prevPage } = usePagination({ totalPages });

    const fetchNoticeData = async () => {
        if (isLoading) return;

        setIsLoading(true);

        const params = new URLSearchParams({
            page: String(page),
            limit: String(LIMIT),
        });

        if (activeTab !== "all") {
            params.set("category", activeTab);
        }

        if (keyword.trim()) {
            params.set("keyword", keyword.trim());
        }

        try {
            const res = await fetch(`/api/notice?${params.toString()}`);
            const data = await res.json();

            setNotices(data.notices);
            setTotal(data.total);
            setTotalPages(data.totalPages);

        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNoticeData();
    }, [page, activeTab, keyword])

    return (
        <div className="flex flex-col p-4">
            <div className="flex justify-between px-2 py-4">
                {/* 최상단 - 제목, 검색, 글쓰기 */}
                <div className="w-full flex justify-between">
                    <h1 className="font-bold text-xl">게시판</h1>

                    {/* 검색 */}
                    <div className="flex gap-3">
                        <div className="flex items-center gap-3 border border-gray-400 px-4 py-2 rounded-md text-gray-500 text-sm font-semibold">
                            <Search size={18} />
                            <input
                                value={keyword}
                                onChange={(e) => {
                                    setKeyword(e.target.value);
                                    setPage(1);
                                }}
                                className="outline-none"
                                placeholder="제목, 작성자 검색"

                            />
                        </div>

                        {/* 글쓰기 버튼 */}
                        <button
                            //onClick={}
                            className="bg-violet-500 text-white rounded-md px-4 py-2"
                        >
                            글쓰기
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-5 border border-gray-200 rounded-lg bg-white p-8">
                <div className="flex flex-col ">
                    <div className="flex gap-8">
                        {NOTICE_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setPage(1);
                                }}
                                className={` p-4
                                ${activeTab === tab.key
                                        ? "border-b-3 border-violet-500 text-violet-600 font-bold"
                                        : "text-gray-500 font-bold"}}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <span className="h-[0.5px] w-full bg-gray-200" />
                </div>

                <div className="grid grid-cols-[100px_1fr_140px_140px_140px] items-center justify-center
                        py-2 px-4 border-y-2 border-gray-200 bg-gray-200/30 text-sm text-gray-500 font-semibold"
                >
                    <p className="text-center">중요</p>
                    <p className="grid-3">제목</p>
                    <p className="text-center">카테고리</p>
                    <p className="text-center">작성자</p>
                    <p className="text-center">작성일</p>
                </div>

                {isLoading
                    ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg bg-violet-50/40 text-gray-500">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                            <p className="text-sm font-semibold text-violet-500">
                                게시글을 불러오는 중입니다
                            </p>
                        </div>
                    )
                    : (notices.map((notice) => {
                        const author = notice.author;
                        const authorName = author?.name ?? "알 수 없음";
                        const authorProfile = author?.profilePic;

                        return (
                            <Link
                                key={notice.id}
                                href={`/notice/${notice.id}`}
                                className="flex flex-col gap-2 justify-center"
                            >
                                <div className="grid grid-cols-[100px_1fr_140px_140px_140px] items-center justify-center px-4">

                                    {/* 고정상태 */}
                                    <div className="flex items-center justify-center">
                                        {notice.isPinned ? <PinIcon className="text-red-600" /> : ""}
                                    </div>

                                    {/* 제목 */}
                                    <p className="font-bold tracking-tight">
                                        {notice.title}
                                    </p>

                                    {/* 카테고리 */}
                                    <p className={`text-center rounded-full py-1 ${getCategoryStyle(notice.category)}`}>
                                        {getCategoryName(notice.category)}
                                    </p>

                                    {/* 작성자 */}
                                    <div className="flex items-center justify-center gap-2">
                                        {/* 프로필 사진 */}
                                        {authorProfile
                                            ? (<img
                                                src={authorProfile}
                                                alt="프로필 사진"
                                                className="w-[1.5rem] h-[1.5rem] rounded-full bg-gray-400"
                                            />)
                                            : (
                                                <div className="flex h-[1.5rem] w-[1.5rem] items-center justify-center rounded-full">
                                                    <User className="w-[1.5rem] h-[1.5rem] rounded-full bg-gray-400" />
                                                </div>
                                            )
                                        }
                                        {/* 이름, 직급 */}
                                        <span className="font-medium text-sm text-gray-600 tracking-tight">
                                            {authorName} {author?.position}
                                        </span>
                                    </div>
                                    {/* 업로드 시간 */}
                                    <span className="text-center text-sm text-gray-400 tracking-tight">
                                        {notice.createdAt.slice(0, 10)}
                                    </span>
                                </div>

                                <span className="h-[0.5px] w-full bg-gray-200" />
                            </Link >
                        )
                    }))
                }

                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        onClick={prevPage}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        이전
                    </button>
                    <span className="text-sm font-medium">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={nextPage}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        다음
                    </button>
                </div>
            </div >

        </div >
    )
}
