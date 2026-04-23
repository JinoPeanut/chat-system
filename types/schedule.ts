
export type ScheduleHome = {
    id: string,
    userId: string,
    title: string,
    titleMemo: string,
    startAt: string,

    // user User @relation(fields:[userId], references:[id])
}

export type ScheduleDetail = {
    id: string,
    userId: string,
    title: string,
    titleMemo?: string,
    content?: string,
    startAt: string,

    // user User @relation(fields:[userId], references:[id])
}