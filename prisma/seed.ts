import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.company.upsert({
        where: { id: "company-1" },
        update: {
            name: "땅콩컴퍼니",
            inviteCode: "Peanut-2026",
        },
        create: {
            id: "company-1",
            name: "땅콩컴퍼니",
            inviteCode: "PEANUT-2026",
        },
    });

    await prisma.user.upsert({
        where: { id: "user-1" },
        update: {
            email: "hong@example.com",
            passwordHash: "temp-hash-test1234",
            createdAt: new Date("2026-04-01T09:00:00.000Z"),
            companyId: "company-1",
        },
        create: {
            id: "user-1",
            name: "홍길동",
            department: "개발팀",
            position: "사원",
            status: "online",
            profilePic: null,
            email: "hong@example.com",
            passwordHash: "temp-hash-test1234",
            createdAt: new Date("2026-04-01T09:00:00.000Z"),
            companyId: "company-1",
        }
    });

    await prisma.user.upsert({
        where: { id: "user-2" },
        update: {
            email: "kim@example.com",
            passwordHash: "temp-hash-test5678",
            createdAt: new Date("2026-04-02T09:00:00.000Z"),
            companyId: "company-1"
        },
        create: {
            id: "user-2",
            name: "김철수",
            department: "개발팀",
            position: "주임",
            status: "offline",
            profilePic: null,
            email: "kim@example.com",
            passwordHash: "temp-hash-test5678",
            createdAt: new Date("2026-04-02T09:00:00.000Z"),
            companyId: "company-1"
        }
    });

    await prisma.user.upsert({
        where: { id: "user-3" },
        update: {
            email: "lee@example.com",
            passwordHash: "temp-hash-test9999",
            createdAt: new Date("2026-04-03T09:00:00.000Z"),
            companyId: "company-1"
        },
        create: {
            id: "user-3",
            name: "이유리",
            department: "경영팀",
            position: "대리",
            status: "AFK",
            profilePic: null,
            email: "lee@example.com",
            passwordHash: "temp-hash-test9999",
            createdAt: new Date("2026-04-03T09:00:00.000Z"),
            companyId: "company-1"
        }
    });

    await prisma.chatRoom.upsert({
        where: { id: "group-1" },
        update: {},
        create: {
            id: "group-1",
            room: "group",
            members: {
                connect: [
                    { id: "user-1" },
                    { id: "user-2" },
                    { id: "user-3" },
                ]
            }
        }
    });

    await prisma.chatRoom.upsert({
        where: { id: "personal-1" },
        update: {},
        create: {
            id: "personal-1",
            room: "personal",
            members: {
                connect: [
                    { id: "user-1" },
                    { id: "user-2" },
                ]
            }
        }
    });

    await prisma.chatRoom.upsert({
        where: { id: "personal-2" },
        update: {},
        create: {
            id: "personal-2",
            room: "personal",
            members: {
                connect: [
                    { id: "user-1" },
                    { id: "user-3" },
                ]
            }
        }
    });

    await prisma.message.upsert({
        where: { id: "message-1" },
        update: {},
        create: {
            id: "message-1",
            senderId: "user-2",
            chatRoomId: "personal-1",
            content: "안녕하세요",
            timeAt: new Date("2026-04-19T00:18:41.866Z"),
        }
    });

    await prisma.message.upsert({
        where: { id: "message-2" },
        update: {},
        create: {
            id: "message-2",
            senderId: "user-1",
            chatRoomId: "personal-1",
            content: "네 안녕하세요",
            timeAt: new Date("2026-04-19T00:18:42.866Z"),
        }
    });

    await prisma.message.upsert({
        where: { id: "message-3" },
        update: {},
        create: {
            id: "message-3",
            senderId: "user-3",
            chatRoomId: "personal-2",
            content: "회의 자료 올렸습니다",
            timeAt: new Date("2026-04-19T00:18:41.866Z"),
        }
    });

    await prisma.message.upsert({
        where: { id: "message-4" },
        update: {},
        create: {
            id: "message-4",
            senderId: "user-1",
            chatRoomId: "group-1",
            content: "오늘 일정 공유드립니다",
            timeAt: new Date("2026-04-19T00:18:41.866Z"),
        }
    });

    await prisma.notice.upsert({
        where: { id: "n1" },
        update: {},
        create: {
            id: "n1",
            category: "notice",
            title: "근로자의 날 안내",
            content: null,
            createdAt: new Date("2026-04-19T00:19:49.035Z"),
            isPinned: true,
            authorId: "user-3",
        }
    });

    await prisma.notice.upsert({
        where: { id: "n2" },
        update: {},
        create: {
            id: "n2",
            category: "event",
            title: "사내 해커톤 참가 신청",
            content: null,
            createdAt: new Date("2026-04-19T00:20:27.283Z"),
            isPinned: false,
            authorId: "user-2",
        }
    });

    await prisma.notice.upsert({
        where: { id: "n3" },
        update: {},
        create: {
            id: "n3",
            category: "update",
            title: "채팅 시스템 v1.2 업데이트",
            content: null,
            createdAt: new Date("2026-04-19T00:21:04.290Z"),
            isPinned: false,
            authorId: "user-1",
        }
    });

    await prisma.leaveBalance.upsert({
        where: { id: "leave-balance-1" },
        update: {},
        create: {
            id: "leave-balance-1",
            userId: "user-1",
            totalDays: 15,
            usedDays: 1.5,
            useHours: 4,
        }
    });

    await prisma.leaveBalance.upsert({
        where: { id: "leave-balance-2" },
        update: {},
        create: {
            id: "leave-balance-2",
            userId: "user-2",
            totalDays: 15,
            usedDays: 1.5,
            useHours: 4,
        }
    });

    await prisma.leaveBalance.upsert({
        where: { id: "leave-balance-3" },
        update: {},
        create: {
            id: "leave-balance-3",
            userId: "user-3",
            totalDays: 15,
            usedDays: 1.5,
            useHours: 4,
        }
    });

    await prisma.leaveHistory.upsert({
        where: { id: "leave-history-1" },
        update: {},
        create: {
            id: "leave-history-1",
            userId: "user-1",
            leaveDate: "2026-01-15",
            usedDays: 1,
            usedHours: 8,
            leaveType: "annual",
            status: "approved",
            reason: "개인 일정",
            createdAt: new Date("2026-01-05T09:10:00.000Z"),
        },
    });

    await prisma.leaveHistory.upsert({
        where: { id: "leave-history-2" },
        update: {},
        create: {
            id: "leave-history-2",
            userId: "user-1",
            leaveDate: "2026-03-21",
            usedDays: 0.5,
            usedHours: 4,
            leaveType: "half_pm",
            status: "approved",
            reason: "병원 방문",
            createdAt: new Date("2026-03-10T02:20:00.000Z"),
        },
    });

    await prisma.leaveHistory.upsert({
        where: { id: "leave-history-3" },
        update: {},
        create: {
            id: "leave-history-3",
            userId: "user-2",
            leaveDate: "2026-02-14",
            usedDays: 1,
            usedHours: 8,
            leaveType: "annual",
            status: "approved",
            reason: "가족 일정",
            createdAt: new Date("2026-02-01T08:00:00.000Z"),
        },
    });

    await prisma.leaveHistory.upsert({
        where: { id: "leave-history-4" },
        update: {},
        create: {
            id: "leave-history-4",
            userId: "user-2",
            leaveDate: "2026-04-05",
            usedDays: 0.5,
            usedHours: 4,
            leaveType: "half_am",
            status: "pending",
            reason: "개인 업무",
            createdAt: new Date("2026-04-01T01:30:00.000Z"),
        },
    });

    await prisma.leaveHistory.upsert({
        where: { id: "leave-history-5" },
        update: {},
        create: {
            id: "leave-history-5",
            userId: "user-3",
            leaveDate: "2026-01-22",
            usedDays: 1,
            usedHours: 8,
            leaveType: "annual",
            status: "approved",
            reason: "휴식",
            createdAt: new Date("2026-01-10T05:40:00.000Z"),
        },
    });

    await prisma.leaveHistory.upsert({
        where: { id: "leave-history-6" },
        update: {},
        create: {
            id: "leave-history-6",
            userId: "user-3",
            leaveDate: "2026-03-08",
            usedDays: 0.5,
            usedHours: 4,
            leaveType: "half_pm",
            status: "rejected",
            reason: "개인 사유",
            createdAt: new Date("2026-03-03T07:10:00.000Z"),
        },
    });

    await prisma.profile.upsert({
        where: { userId: "user-1" },
        update: {},
        create: {
            userId: "user-1",
            statusMsg: "오늘도 화이팅!",
            statusWork: "office",
            bestWorker: false,
            tel: "010-1234-5678",
        }
    })

    await prisma.schedule.deleteMany();

    await prisma.schedule.create({
        data: {
            userId: "user-1",
            title: "팀 회의",
            titleMemo: "노트북 꼭 챙겨가기!",
            content: "이번 주 스프린트 계획 논의",
            startAt: new Date("2026-04-23T11:00:00"),
            endAt: new Date("2026-04-23T12:00:00"),
        }
    })

    await prisma.schedule.create({
        data: {
            userId: "user-1",
            title: "컴포넌트 리팩토링",
            titleMemo: "SideBar 먼저",
            content: "기술 부채 정리",
            startAt: new Date("2026-04-23T14:00:00"),
            endAt: new Date("2026-04-23T16:00:00"),
        }
    })

    await prisma.schedule.create({
        data: {
            userId: "user-1",
            title: "코드 리뷰",
            titleMemo: undefined,
            content: "PR #12 리뷰",
            startAt: new Date("2026-04-23T16:30:00"),
            endAt: new Date("2026-04-23T17:30:00"),
        }
    })

    await prisma.schedule.create({
        data: {
            userId: "user-1",
            title: "디자인 회의",
            titleMemo: "피그마 링크 준비",
            content: "UI 개선 논의",
            startAt: new Date("2026-04-23T10:00:00"),
            endAt: new Date("2026-04-23T11:00:00"),
        }
    })

    await prisma.schedule.create({
        data: {
            userId: "user-1",
            title: "마무리 잔업",
            titleMemo: "UI 남았다!",
            content: null,
            startAt: new Date("2026-04-23T19:00:00"),
            endAt: new Date("2026-04-23T20:00:00"),
        }
    })

    await prisma.schedule.create({
        data: {
            userId: "user-1",
            title: "일정 패널 완성",
            titleMemo: "데이터 연결 확인",
            content: null,
            startAt: new Date("2026-04-26T19:00:00"),
            endAt: new Date("2026-04-26T20:00:00"),
        }
    })
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.log(e);
        await prisma.$disconnect();
        process.exit(1);
    })