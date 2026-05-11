import { User } from "@prisma/client"

export type ProfileWork = "office" | "house"

export type ProfileForm = {
    statusMsg: string,
    statusWork: ProfileWork,
    tel: string,
    profilePic: string | null,
}

export type Profile = {
    userId: string,
    profileUser: User,
    statusMsg?: string,
    statusWork: ProfileWork,
    bestWorker: boolean,
    tel: string,
}