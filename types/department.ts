import { User } from "./chat"

export type Department = {
    id: string, // 부서 아이디
    name: string, // 부서 이름
    members: User[], // 부서 인원
}
