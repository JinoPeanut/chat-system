export const getCategoryStyle = (category: string) => {
    if (category === "notice") return "bg-violet-100 text-violet-600"
    if (category === "event") return "bg-emerald-100 text-emerald-600"
    if (category === "update") return "bg-indigo-100 text-indigo-600"
    if (category === "etc") return "bg-amber-100 text-amber-600"
}

export const getCategoryName = (category: string) => {
    if (category === "all") return "전체"
    if (category === "notice") return "공지사항"
    if (category === "event") return "이벤트"
    if (category === "update") return "업데이트"
    if (category === "etc") return "기타"
}