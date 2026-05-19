"use client";

import { getCategoryName, getCategoryStyle } from "@/utils/noticeUtils";
import { ChevronDown, ChevronLeft, ChevronRight, PinIcon } from "lucide-react";
import { useEffect, useState } from "react"
import NoticeEditor from "./NoticeEditor";
import PreviewIcon from "./PreviewIcon";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { NoticeAttachment } from "@/types/notice";

type NoticeInputPanelProps = {
    mode: "create" | "edit"
    noticeId?: string,
}

const noticeCategoryField = [
    { key: "notice" }, { key: "event" }, { key: "update" }, { key: "etc" }
]

export default function NoticeInputPanel({ mode, noticeId }: NoticeInputPanelProps) {
    const authUser = useAuthStore((state) => state.user);
    const router = useRouter();
    const [form, setForm] = useState({
        title: "",
        category: "",
        content: "",
        isPinned: false,
    })

    const [error, setError] = useState({
        title: "",
        category: "",
        content: "",
        isPinned: false,
    })

    const [selectedFile, setSelectedFile] = useState<File[]>([]);

    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"error" | "success">("success");

    const [isProcessing, setIsProcessing] = useState(false);
    const [existingAttachments, setExistingAttachments] = useState<NoticeAttachment[]>([]);
    const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([]);
    const [categoryOpen, setCategoryOpen] = useState(false);

    const titleLength = form.title.length;
    const contentLength = form.content.length;
    const hasPreviewContent = Boolean(form.category || form.title || form.content);

    const visibleExistingAttachments = existingAttachments.filter(
        (file) => !deletedAttachmentIds.includes(file.id)
    );

    const hasVisibleExistingAttachments = visibleExistingAttachments.length > 0;
    const hasSelectedFiles = selectedFile.length > 0;

    const handleChange = (key: keyof typeof form, value: string) => {
        if (key === "title" && value.length > 100) return;

        setForm((prev) => ({
            ...prev,
            [key]: value,
        }))

        setError((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleSelectFile = (file: File[]) => {
        setSelectedFile(file);
    }

    const handleTogglePinned = () => {
        setForm((prev) => ({
            ...prev,
            isPinned: !prev.isPinned,
        }))
    }

    const handleRemoveExistingAttachment = (attachmentId: string) => {
        setDeletedAttachmentIds((prev) => [...prev, attachmentId]);
    };

    const showToast = (message: string, type: "success" | "error") => {
        if (toastMessage) return;

        setToastMessage(message);
        setToastType(type);

        setTimeout(() => {
            setToastMessage("");
        }, 1500);
    }

    const fetchNoticeData = async () => {
        if (!noticeId) return;

        const res = await fetch(`/api/notice/${noticeId}`);
        const data = await res.json();

        if (!res.ok) {
            showToast(data.message ?? "게시글 정보를 불러오지 못했습니다", "error");
            return;
        }

        setForm({
            title: data.title ?? "",
            category: data.category ?? "",
            content: data.content ?? "",
            isPinned: data.isPinned ?? false,
        })

        setExistingAttachments(data.attachments ?? []);
    }

    const handleCreateNotice = async () => {
        if (isProcessing) return
        setToastMessage("");

        if (!form.title.trim()) {
            showToast("제목을 입력해 주세요.", "error");
            return;
        }

        if (!form.category) {
            showToast("카테고리를 선택해 주세요.", "error");
            return;
        }

        const formData = new FormData();

        formData.append("title", form.title);
        formData.append("category", form.category);
        formData.append("content", form.content);
        formData.append("isPinned", String(form.isPinned));

        selectedFile.forEach((file) => {
            formData.append("files", file);
        })

        try {
            setIsProcessing(true);

            const res = await fetch("/api/notice", {
                method: "POST",
                body: formData,
            })

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    showToast("로그인이 필요합니다.", "error");
                } else if (res.status === 400) {
                    showToast("제목과 카테고리는 필수입니다.", "error");
                } else if (res.status === 404) {
                    showToast("사용자를 찾을 수 없습니다.", "error");
                }

                return;
            }

            showToast("게시글이 등록되었습니다.", "success");

            setTimeout(() => {
                router.push(`/notice/${data.id}`);
            }, 1500)
        } catch (error) {
            showToast("서버와 연결할 수 없습니다.", "error");
        } finally {
            setIsProcessing(false);
        }
    }

    const handleEditNotice = async () => {
        if (isProcessing) return;

        setToastMessage("");

        if (!noticeId) {
            showToast("수정할 게시글 정보를 찾을 수 없습니다", "error");
            return;
        }

        if (!form.title.trim()) {
            showToast("제목을 입력해 주세요.", "error");
            return;
        }

        if (!form.category) {
            showToast("카테고리를 선택해 주세요.", "error");
            return;
        }

        const formData = new FormData();

        formData.append("id", noticeId);
        formData.append("title", form.title);
        formData.append("category", form.category);
        formData.append("content", form.content);
        formData.append("isPinned", String(form.isPinned));

        deletedAttachmentIds.forEach((attachmentId) => {
            formData.append("deletedAttachmentIds", attachmentId);
        });

        selectedFile.forEach((file) => {
            formData.append("files", file);
        });

        try {
            setIsProcessing(true);

            const res = await fetch("/api/notice", {
                method: "PATCH",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    showToast("로그인이 필요합니다.", "error");
                } else if (res.status === 400) {
                    showToast("수정할 값이 올바르지 않습니다.", "error");
                } else if (res.status === 404) {
                    showToast("수정할 수 없는 게시글입니다.", "error");
                } else {
                    showToast("게시글 수정에 실패했습니다.", "error");
                }

                return;
            }

            showToast("게시글이 수정되었습니다.", "success");

            setTimeout(() => {
                router.push(`/notice/${data.id}`);
            }, 1500)

        } catch (error) {
            showToast("서버와 연결할 수 없습니다", "error");
        } finally {
            setIsProcessing(false);
        }
    }


    const handleSubmit = async () => {
        if (mode === "create") {
            await handleCreateNotice();
        }

        if (mode === "edit") {
            await handleEditNotice();
        }
    }

    useEffect(() => {
        if (mode !== "edit") return
        if (!noticeId) return;

        fetchNoticeData();
    }, [mode, noticeId])

    return (
        <div className="h-[100dvh] flex flex-col gap-4 px-8 py-6">
            {/* 상호작용 메세지 */}
            {toastMessage && (
                <div className={`fixed right-40 top-15 z-50 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg
                    animate-slide-toast ${toastType === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {toastMessage}
                    <div className={`mt-2 animate-toast-timer h-1 w-full ${toastType === "error" ? "bg-red-300" : "bg-emerald-300"}`} />
                </div>
            )}

            {/* 상단 - 뒤로가기, 임시저장, 등록 */}
            <div className="flex justify-between">
                <div className="flex items-center text-gray-600 group">
                    <ChevronLeft className="group-hover:text-gray-800 cursor-pointer" />
                    <p className="group-hover:text-gray-800 cursor-pointer">
                        목록으로
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="text-white bg-violet-500 border border-violet-500 rounded-md px-4 py-2 cursor-pointer"
                    >
                        {isProcessing
                            ? mode === "edit" ? "수정중.." : "등록중..."
                            : mode === "edit" ? "수정하기" : "등록하기"
                        }
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-[1fr_280px] gap-5">

                {/* 메인 - 글 작성 부분 */}
                <div className="flex flex-col gap-5 min-h-0 bg-white rounded-md shadow-sm px-6 pt-4 pb-10">
                    {/* 카테고리 영역 */}
                    <div className="grid grid-cols-[130px_130px] items-center">
                        <label className="font-bold">
                            카테고리
                            <span className="text-red-600 ml-1">*</span>
                        </label>
                        <div
                            onClick={() => setCategoryOpen((prev) => !prev)}
                            className="relative flex items-center gap-2 rounded-md w-[170px] border border-gray-200 px-4 py-1 cursor-pointer"
                        >
                            <div className="flex items-center gap-6">
                                <span className={`w-full text-center rounded-full px-3 py-1 ${form.category ? getCategoryStyle(form.category) : ""}`}>
                                    {form.category ? getCategoryName(form.category) : "카테고리"}
                                </span>
                                {categoryOpen ? (<ChevronDown />) : (<ChevronRight />)}
                            </div>

                            {categoryOpen && (
                                <div className="absolute left-0 top-11 z-20 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                                    {noticeCategoryField.map((option) => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleChange("category", option.key);
                                                setCategoryOpen(false);
                                            }}
                                            className={`mb-1 w-full rounded-full px-3 py-1 text-sm hover:bg-violet-50 cursor-pointer ${getCategoryStyle(option.key)}`}
                                        >
                                            {getCategoryName(option.key)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 제목 영역 */}
                    <div className="grid grid-cols-[130px_1fr] items-center">
                        <label className="font-bold">
                            제목
                            <span className="text-red-600 ml-1">*</span>
                        </label>

                        <div className="relative">
                            <input
                                value={form.title}
                                type="text"
                                placeholder="제목을 입력해주세요."
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="outline-none w-full border border-gray-200 rounded-md py-2 px-4"
                            />
                            <p className={`absolute right-2 top-12 ${titleLength === 100 ? "text-red-500" : "text-gray-500"}`}>{titleLength} / 100</p>
                        </div>
                    </div>

                    {/* 텍스트내용 영역 */}
                    <div className="grid grid-cols-[130px_1fr] items-start mt-8">
                        <label className="font-bold mt-2">
                            내용
                        </label>

                        <div className="relative">
                            <NoticeEditor
                                value={form.content}
                                onChange={(value) => handleChange("content", value)}
                            />
                            <p className={`absolute right-3 bottom-4 ${contentLength === 10000 ? "text-red-500" : "text-gray-500"}`}>{titleLength} / 10000</p>
                        </div>
                    </div>

                    {/* 첨부파일 영역 */}
                    <div className="grid grid-cols-[130px_1fr] items-start">
                        <label className="font-bold mt-2">
                            첨부파일
                        </label>


                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                            }}
                            onDrop={(e) => {
                                e.preventDefault();

                                const files = Array.from(e.dataTransfer.files ?? []);
                                if (files.length === 0) return;

                                handleSelectFile(files);
                            }}
                            className="flex items-center gap-4 border border-gray-200 bg-gray-100/50 rounded-md p-4"
                        >
                            <label htmlFor="input-file" className="bg-white px-4 py-2 rounded-md border border-violet-500 text-violet-600">
                                파일선택
                            </label>

                            {mode === "edit" && hasVisibleExistingAttachments && (
                                <div className="flex flex-col gap-1">
                                    <p className="font-medium text-gray-700">기존 첨부파일</p>

                                    {visibleExistingAttachments.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center gap-2"
                                        >
                                            <span>{file.fileName}</span>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingAttachment(file.id)}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {hasSelectedFiles
                                && (<p className="text-sm text-gray-500">
                                    새로 첨부할 파일: {selectedFile.map((file, index) => {
                                        return (
                                            <span key={`${file.name}-${index}`}> {file.name}</span>
                                        )
                                    })}
                                </p>)
                            }

                            {!hasVisibleExistingAttachments && !hasSelectedFiles && (
                                <p className="text-sm text-gray-500">
                                    또는 파일을 드래그 해서 첨부하세요
                                </p>
                            )}

                            <input
                                id="input-file"
                                type="file" multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files ?? [])
                                    if (files.length === 0) return;
                                    handleSelectFile(files);
                                }}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* 작성 옵션 카드 */}
                <div className="flex flex-col gap-5 min-h-0 bg-white rounded-md shadow-sm px-6 pt-4 pb-10">
                    <h3 className="font-bold">작성 옵션</h3>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between mt-5">
                            <h3 className="font-semibold">상단 고정</h3>
                            <button
                                onClick={handleTogglePinned}
                                className={`relative h-6 w-11 rounded-full transition-color ${form.isPinned ? "bg-violet-500" : "bg-gray-300"}`}
                            >
                                <span className={`absolute h-4 w-4 left-1 top-1 rounded-full bg-white transition-transform ${form.isPinned ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 nowrap-space">목록 최상단에 노출됩니다.</p>
                    </div>

                    <span className="w-full h-[1px] bg-gray-200/70" />

                    <h3 className="font-semibold">미리보기</h3>

                    {hasPreviewContent
                        ? (<div className="flex flex-col gap-3 min-h-0 flex-1">
                            <div className="flex items-center gap-1">
                                <span className={`text-center rounded-full px-3 py-1 ${form.category ? getCategoryStyle(form.category) : ""}`}>{getCategoryName(form.category)}</span>
                                {form.isPinned ? <PinIcon size={18} className="text-red-600" /> : ""}
                            </div>
                            <p className="font-bold truncate">{form.title}</p>
                            <div
                                dangerouslySetInnerHTML={{ __html: form.content }}
                                className="truncatge line-clamp-4"
                            />
                            <div className="flex items-center gap-2 text-sm text-gray-500 text-medium">
                                <span>{authUser?.name}</span>
                                <div className="w-1 h-1 bg-black rounded-full" />
                                <span>작성 예정</span>
                            </div>
                        </div>)
                        : (<div className="flex flex-col gap-3 min-h-0 flex-1 items-center justify-center">
                            <PreviewIcon />
                            <p className="text-sm font-medium text-gray-500 text-center">제목과 내용을 입력하면 미리보기가 표시됩니다.</p>
                        </div>)
                    }
                </div>
            </div>

        </div>
    )
}