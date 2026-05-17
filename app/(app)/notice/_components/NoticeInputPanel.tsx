"use client";

import { getCategoryName, getCategoryStyle } from "@/utils/noticeUtils";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react"
import NoticeEditor from "./NoticeEditor";

const noticeInputField = [
    { key: "title", label: "제목", type: "text", placeholder: "제목을 입력해주세요." },
    { key: "content", label: "내용", type: "textField", placeholder: "내용을 입력해주세요." },
    { key: "file", label: "첨부파일", type: "file", placeholder: "또는 파일을 드래그 해서 첨부하세요" }
] as const;

const noticeCategoryField = [
    { key: "notice" }, { key: "event" }, { key: "update" }, { key: "etc" }
]

export default function NoticeInputPanel() {
    const [form, setForm] = useState({
        title: "",
        category: "",
        content: "",
    })

    const [error, setError] = useState({
        title: "",
        category: "",
        content: "",
    })

    const [submitError, setSubmitError] = useState("");
    const [categoryOpen, setCategoryOpen] = useState(false);

    const titleLength = form.title.length;

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }))

        setError((prev) => ({
            ...prev,
            [key]: value,
        }))
    }


    return (
        <div className="h-[100dvh] flex flex-col gap-4 px-8 py-6">
            {/* 상단 - 뒤로가기, 임시저장, 등록 */}
            <div className="flex justify-between">
                <div className="flex items-center text-gray-600 group">
                    <ChevronLeft className="group-hover:text-gray-800 cursor-pointer" />
                    <p className="group-hover:text-gray-800 cursor-pointer">
                        목록으로
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <button className="text-violet-600 border border-gray-300 rounded-md px-4 py-2 cursor-pointer">
                        임시저장
                    </button>
                    <button className="text-white bg-violet-500 border border-violet-500 rounded-md px-4 py-2 cursor-pointer">
                        등록하기
                    </button>
                </div>
            </div>

            {/* 메인 - 글 작성 부분 */}
            <div className="flex flex-col gap-5 min-h-0 bg-white rounded-md shadow-sm px-6 pt-4 pb-10">
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
                                        onClick={() => {
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

                <div className="grid grid-cols-[130px_1fr] items-center">
                    <label className="font-bold">
                        제목
                        <span className="text-red-600 ml-1">*</span>
                    </label>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="제목을 입력해주세요."
                            onChange={(e) => handleChange("title", e.target.value)}
                            className="outline-none w-full border border-gray-200 rounded-md py-2 px-4"
                        />
                        <p className="absolute right-2 top-12 text-gray-500">{titleLength} / 100</p>
                    </div>
                </div>

                <div className="grid grid-cols-[130px_1fr] items-start mt-8">
                    <label className="font-bold">
                        내용
                    </label>

                    <div className="relative">
                        <NoticeEditor
                            value={form.content}
                            onChange={(value) => handleChange("content", value)}
                        />
                        <p className="absolute right-2 top-12 text-gray-500">{titleLength} / 100</p>
                    </div>
                </div>

            </div>
        </div>
    )
}