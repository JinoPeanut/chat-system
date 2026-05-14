type NoticeDetailProps = {
    noticeId: string,
}

export default function NoticeDetail({ noticeId }: NoticeDetailProps) {
    return (
        <div>
            게시판 상세페이지: {noticeId}
        </div>
    )
}