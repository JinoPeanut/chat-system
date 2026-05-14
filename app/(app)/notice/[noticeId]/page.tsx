import { use } from "react";
import NoticeDetail from "./_components/NoticeDetail";

export default function NoticeDetailPage({ params }: { params: Promise<{ noticeId: string }> }) {
    const { noticeId } = use(params);

    return <NoticeDetail noticeId={noticeId} />
}