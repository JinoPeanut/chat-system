"use client";
import { use } from "react";
import NoticeInputPanel from "../../_components/NoticeInputPanel";

export default function NoticeEditPage({ params }: { params: Promise<{ noticeId: string }> }) {
    const { noticeId } = use(params);
    return <NoticeInputPanel mode={"edit"} noticeId={noticeId} />
}