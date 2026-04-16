export type Leave = {
    userId: string,
    totalDays: number,
    usedDays: number,
    useHours: number,
}

export const LEAVE: Record<string, Leave> = {
    leave1: {
        userId: "user-1",
        totalDays: 15,
        usedDays: 2,
        useHours: 0,
    }
}