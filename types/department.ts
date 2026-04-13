import { User, USERS } from "./chat"

export type Department = {
    readonly id: string, // 부서 아이디
    readonly name: string, // 부서 이름
    readonly members: User[], // 부서 인원
}

export const DEPARTMENT: Record<string, Department> = {
    develope: {
        id: "dept-1",
        name: "개발팀",
        members: [USERS.user1, USERS.user2],
    },

    management: {
        id: "manage-1",
        name: "경영팀",
        members: [USERS.user3],
    }
}
