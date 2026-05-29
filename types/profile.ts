
export type ProfileWork = "office" | "house"

export type ProfileForm = {
    statusMsg: string,
    statusWork: ProfileWork,
    tel: string,
    profilePic: string | null,
}

export type HomeProfile = {
    statusMsg: string | null,
    statusWork: ProfileWork,
    bestWorker: boolean,
    tel: string,
}