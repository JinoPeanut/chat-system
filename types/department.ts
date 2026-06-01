import { User } from "./chat"

export type Department = {
    id: string, // 부서 아이디
    name: string, // 부서 이름
    members: User[], // 부서 인원
}

export type AdminDepartment = {
    id: string,
    name: string,
    description: string | null,
    managerId: string | null,
    createdAt: string,
    updatedAt: string,
    manager?: {
        id: string,
        name: string,
        position: string,
        profilePic: string | null,
    } | null,
}