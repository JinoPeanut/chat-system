import { User } from "@prisma/client"

export type ProfileWork = "office" | "house"

export type Profile = {
    userId: string,
    profileUser: User,
    statusMsg?: string,
    statusWork: ProfileWork,
    bestWorker: boolean,
    tel: string,
}