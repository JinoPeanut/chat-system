export type ScheduleHome = {
    id: string,
    title: string,
    titleMemo?: string,
    startAt: string,
    endAt?: string,
}

export type ScheduleDetail = {
    id: string,
    title: string,
    titleMemo?: string,
    content?: string,
    startAt: string,
    endAt?: string,
}