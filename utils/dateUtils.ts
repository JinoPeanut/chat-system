export const formatCreatedAt = (createdAt: string) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
}

// 서버 시간 계산용
export const getKoreanDateTime = (now: Date) => {
    const parts = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(now);

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value])
    );

    return {
        date: `${values.year}-${values.month}-${values.day}`,
        minutes: Number(values.hour) * 60 + Number(values.minute),
    };
};
