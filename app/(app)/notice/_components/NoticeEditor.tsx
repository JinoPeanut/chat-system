"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { Underline } from "@tiptap/extension-underline"
import { StarterKit } from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import Link from "@tiptap/extension-link";
import { useState } from "react";
import { Link2, List, ListOrdered } from "lucide-react";

type NoticeEditorProps = {
    value: string,
    onChange: (value: string) => void,
}

type FontSize = "" | "12px" | "14px" | "16px" | "20px" | "24px";

type toggleType = {
    fontSize: FontSize,
    bold: boolean,
    italic: boolean,
    underline: boolean,
    strike: boolean,
    bulletList: boolean,
    orderedList: boolean,
    link: boolean,
}

export default function NoticeEditor({ value, onChange }: NoticeEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            FontSize,
            Link.configure({
                openOnClick: false,
            })
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        }
    });

    const [activeToggle, setActiveToggle] = useState<toggleType>({
        fontSize: "",
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        bulletList: false,
        orderedList: false,
        link: false,
    })

    const handleSetLink = () => {
        if (activeToggle.link) {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();

            setActiveToggle((prev) => ({
                ...prev,
                link: !prev.link,
            }));

            return;
        }
        const prevUrl = editor?.getAttributes("link").href;
        const url = window.prompt("URL을 입력하세요", prevUrl);

        if (url === null) return;

        if (url === "") {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();

        setActiveToggle((prev) => ({
            ...prev,
            link: true,
        }))
    }

    if (!editor) return null;

    return (
        <div className="rounded-md border border-gray-200">
            <div className="flex gap-5 border-b border-gray-200 px-2 py-2">

                {/* 폰트 사이즈 */}
                <select
                    value={activeToggle.fontSize}
                    onChange={(e) => {
                        const size = e.target.value as FontSize;

                        if (size === "") {
                            editor.chain().focus().unsetFontSize().run();
                        } else {
                            editor.chain().focus().setFontSize(size).run();
                        }

                        setActiveToggle((prev) => ({
                            ...prev,
                            fontSize: size,
                        }));
                    }}
                >
                    <option value="">size</option>
                    <option value="12px">12</option>
                    <option value="14px">14</option>
                    <option value="16px">16</option>
                    <option value="20px">20</option>
                    <option value="24px">24</option>
                </select>

                {/* 경계선 */}
                <span className="w-[0.5px] h-7 bg-gray-200" />

                {/* 폰트 bold 버튼 */}
                <button
                    type="button"
                    onClick={() => {
                        editor.chain().focus().toggleBold().run()
                        setActiveToggle((prev) => ({
                            ...prev,
                            bold: !prev.bold
                        }))
                    }}
                    className={`w-7 h-7 rounded-md text-center cursor-pointer font-bold ${activeToggle.bold ? "bg-gray-200 text-violet-600" : ""}`}
                >
                    B
                </button>

                {/* 텍스트 Italic 버튼 */}
                <button
                    type="button"
                    onClick={() => {
                        editor.chain().focus().toggleItalic().run()
                        setActiveToggle((prev) => ({
                            ...prev,
                            italic: !prev.italic,
                        }))
                    }}
                    className={`w-7 h-7 rounded-md text-center cursor-pointer italic ${activeToggle.italic ? "bg-gray-200 text-violet-600" : ""}`}
                >
                    I
                </button>

                {/* 텍스트 underline 버튼 */}
                <button
                    type="button"
                    onClick={() => {
                        editor.chain().focus().toggleUnderline().run()
                        setActiveToggle((prev) => ({
                            ...prev,
                            underline: !prev.underline,
                        }))
                    }}
                    className={`w-7 h-7 rounded-md text-center cursor-pointer underline ${activeToggle.underline ? "bg-gray-200 text-violet-600" : ""}`}
                >
                    U
                </button>

                {/* 텍스트 가로줄 버튼 */}
                <button
                    type="button"
                    onClick={() => {
                        editor.chain().focus().toggleStrike().run()
                        setActiveToggle((prev) => ({
                            ...prev,
                            strike: !prev.strike,
                        }))
                    }}
                    className={`w-7 h-7 rounded-md text-center cursor-pointer line-through ${activeToggle.strike ? "bg-gray-200 text-violet-600" : ""}`}
                >
                    S
                </button>

                {/* 글머리 목록 버튼 */}
                <button
                    type="button"
                    onClick={() => {
                        editor.chain().focus().toggleBulletList().run()
                        setActiveToggle((prev) => ({
                            ...prev,
                            bulletList: !prev.bulletList,
                        }))
                    }}
                    className={`w-7 h-7 rounded-md text-center cursor-pointer ${activeToggle.bulletList ? "bg-gray-200 text-violet-600" : ""}`}
                >
                    <div className="flex items-center justify-center">
                        <List size={15} />
                    </div>
                </button>

                {/* 번호 목록 버튼 */}
                <button
                    type="button"
                    onClick={() => {
                        editor.chain().focus().toggleOrderedList().run()
                        setActiveToggle((prev) => ({
                            ...prev,
                            orderedList: !prev.orderedList,
                        }))
                    }}
                    className={`w-7 h-7 rounded-md text-center cursor-pointer ${activeToggle.orderedList ? "bg-gray-200 text-violet-600" : ""}`}
                >
                    <div className="flex items-center justify-center">
                        <ListOrdered size={15} />
                    </div>
                </button>

                {/* 링크 버튼 */}
                <button
                    type="button"
                    onClick={handleSetLink}
                    className={`w-7 h-7 rounded-md text-center cursor-pointer ${activeToggle.link ? "bg-gray-200 text-violet-600" : ""}`}
                >
                    <div className="flex items-center justify-center">
                        <Link2 size={15} />
                    </div>
                </button>
            </div>

            <EditorContent
                editor={editor}
                className="min-h-[260px] px-4 py-3 
                    [&_.ProseMirror]:min-h-[240px]
                    [&_.ProseMirror]:outline-none
                    [&_.ProseMirror_a]:text-blue-600
                    [&_.ProseMirror_a]:underline"
            />
        </div>
    )
}