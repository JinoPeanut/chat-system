"use client"

import ProfileAvatar from "@/components/common/ProfileAvatar";
import { usePagination } from "@/hooks/notice/usePagination";
import { AdminNotice, NOTICE_TABS } from "@/types/notice";
import { formatCreatedAt } from "@/utils/dateUtils";
import { getCategoryName, getCategoryStyle } from "@/utils/noticeUtils";
import { CalendarDaysIcon, ChevronDown, ChevronRight, Pin, RefreshCcw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AdminNoticeResponse = {
    message: string,
    notices: AdminNotice[],
    page: number,
    limit: number,
    totalPages: number,
}

export default function AdminNoticePage() {
    const LIMIT = 7;
    const [notices, setNotices] = useState<AdminNotice[]>([]);

    const [errorMessage, setErrorMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const [totalPages, setTotalPages] = useState(1);
    const { page, setPage, nextPage, prevPage } = usePagination({ totalPages });

    const [selectCategory, setSelectCategory] = useState("");
    const [selectOpen, setSelectOpen] = useState({
        category: false,
        periodStart: false,
        periodEnd: false,
    })
    const [keyword, setKeyword] = useState("");
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");

    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    const showErrorMessage = (message: string) => {
        setErrorMessage(message);

        setTimeout(() => {
            setErrorMessage("");
        }, 1500);
    }

    const fetchNoticeData = async () => {
        if (isProcessing) return;

        const params = new URLSearchParams({
            page: String(page),
            limit: String(LIMIT),
        });

        if (selectCategory) {
            params.set("category", selectCategory);
        }

        if (periodStart) {
            params.set("periodStart", periodStart);
        }

        if (periodEnd) {
            params.set("periodEnd", periodEnd);
        }

        if (keyword.trim()) {
            params.set("keyword", keyword.trim());
        }

        try {
            setIsProcessing(true);

            const res = await fetch(`/api/admin/notices?${params.toString()}`);
            const data: AdminNoticeResponse = await res.json();

            if (!res.ok) {
                showErrorMessage(data.message ?? "연차 정보를 불러오지 못했습니다.");
                return;
            }

            setNotices(data.notices);
            setTotalPages(data.totalPages);

        } catch (error) {
            showErrorMessage("서버에 연결할 수 없습니다.");
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        fetchNoticeData();
    }, [page, keyword, selectCategory, periodStart, periodEnd])

    return (
        <div className="relative h-[100dvh] w-full flex flex-col gap-2 px-8 py-6">
            <h2 className="font-bold text-lg">게시글 관리</h2>
            <p className="font-semibold text-sm text-gray-500">공지사항 및 일반 게시글을 관리할 수 있습니다.</p>

            {errorMessage && (
                <div className="absolute right-5 top-15 animate-slide-toast bg-red-100 rounded-md px-4 py-2">
                    <p className="text-sm text-red-500">{errorMessage}</p>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-red-100">
                        <div className="h-full bg-red-500 animate-toast-timer" />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 mt-5">

                {/* 제목, 작성자 검색 */}
                <div className="flex border border-gray-300 rounded-lg p-2 bg-white">
                    <input
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value)
                            setPage(1);
                        }}
                        type="text"
                        placeholder="제목, 작성자 검색"
                        className="outline-none"
                    />
                    <Search size={18} className="text-gray-500" />
                </div>

                {/* 카테고리 선택 */}
                <div
                    onClick={() => setSelectOpen((prev) => ({
                        ...prev,
                        category: !prev.category,
                    }))}
                    className="relative w-44 rounded-lg px-4 py-2 border border-gray-300 bg-white"
                >
                    <div className="flex gap-2 items-center">
                        <span className="text-center text-gray-600">{selectCategory ? getCategoryName(selectCategory) : "전체 카테고리"}</span>
                        {selectOpen.category ? (<ChevronRight size={18} className="absolute right-5" />) : (<ChevronDown size={18} className="absolute right-5" />)}
                    </div>
                    {selectOpen.category && (
                        <div className="absolute left-0 top-full mt-2 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                            {NOTICE_TABS.map((notice) => {
                                return (
                                    <button
                                        key={notice.key}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectCategory(notice.key === "all" ? "" : notice.key);
                                            setSelectOpen((prev) => ({
                                                ...prev,
                                                category: false,
                                            }));
                                            setPage(1);
                                        }}
                                        className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer`}
                                    >
                                        {notice.label}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* 날짜 선택 */}
                <div className="flex items-center gap-2 rounded-lg px-4 py-2 border border-gray-300 bg-white">

                    <button
                        type="button"
                        onClick={() => startDateRef.current?.showPicker()}
                        className="text-sm text-gray-600 w-22"
                    >
                        {periodStart || "시작일"}
                    </button>

                    <span className="text-gray-400">~</span>

                    <button
                        type="button"
                        onClick={() => endDateRef.current?.showPicker()}
                        className="text-sm text-gray-600 w-22"
                    >
                        {periodEnd || "종료일"}
                    </button>

                    <CalendarDaysIcon size={18} className="text-gray-600" />

                    <input
                        ref={startDateRef}
                        type="date"
                        value={periodStart}
                        onChange={(e) => {
                            const nextStart = e.target.value;

                            if (periodEnd && nextStart > periodEnd) {
                                showErrorMessage("시작일은 종료일보다 늦을 수 없습니다");
                                return;
                            }

                            setPeriodStart(nextStart);
                            setPage(1);
                        }}
                        className="date-input-clean w-[110px] sr-only outline-none text-sm text-gray-600"
                    />

                    <input
                        ref={endDateRef}
                        type="date"
                        value={periodEnd}
                        onChange={(e) => {
                            const nextEnd = e.target.value;

                            if (periodStart && nextEnd < periodStart) {
                                showErrorMessage("종료일은 시작일보다 빠를 수 없습니다");
                                return;
                            }
                            setPeriodEnd(nextEnd);
                            setPage(1);
                        }}
                        className="date-input-clean w-[110px] sr-only outline-none text-sm text-gray-600"
                    />
                </div>

                {/* 선택 초기화 버튼 */}
                <button
                    onClick={() => {
                        setSelectCategory("");
                        setKeyword("");
                        setPeriodStart("");
                        setPeriodEnd("");
                        setPage(1);
                    }}
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                >
                    <RefreshCcw className="refresh-icon" />
                </button>
            </div>

            {/* 게시글 관리 대시보드 */}
            <div className="grid grid-cols-[60px_minmax(240px,1fr)_120px_180px_140px_90px_140px] mt-3
                            border-t border-l border-r border-gray-300 rounded-t-lg px-8 py-2">
                <p className="mx-auto">고정</p>
                <p>제목</p>
                <p className="text-start">카테고리</p>
                <p>작성자</p>
                <p>작성일</p>
                <p className="text-center">조회수</p>
                <p className="text-center">작업</p>
            </div>

            <div className="flex flex-col border border-gray-300 rounded-b-lg bg-white">
                {notices.map((item, index) => {
                    const isLast = index === notices.length - 1;
                    return (
                        <div key={item.id}>
                            <div className="grid grid-cols-[60px_minmax(240px,1fr)_120px_180px_140px_90px_140px] items-center px-8 py-3">
                                <p>{item.isPinned ? (<Pin size={20} className="text-red-500 mx-auto" />) : ""}</p>
                                <p className="truncate pr-4">{item.title}</p>
                                <p className={`text-start w-fit px-2 rounded-full ${getCategoryStyle(item.category)}`}>{getCategoryName(item.category)}</p>
                                <div className="flex items-center gap-2">
                                    <ProfileAvatar
                                        src={item.author.profilePic}
                                        alt={`${item.author.name} 프로필 사진`}
                                        size={20}
                                    />
                                    {item.author.name}
                                </div>
                                <p>{formatCreatedAt(item.createdAt)}</p>
                                <p className="text-center">{item.viewCount}</p>
                                <div className="flex gap-1 justify-center">
                                    <button>1</button>
                                </div>
                            </div>

                            {!isLast && <div className="w-full h-[1px] bg-gray-200" />}
                        </div>
                    )
                })}
            </div>

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
        </div>
    )
}