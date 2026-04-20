import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.user.upsert({
        where: { id: "user-1" },
        update: {},
        create: {
            id: "user-1",
            name: "홍길동",
            department: "개발팀",
            position: "사원",
            status: "online",
            profilePic: null,
        }
    });

    await prisma.user.upsert({
        where: { id: "user-2" },
        update: {},
        create: {
            id: "user-2",
            name: "김철수",
            department: "개발팀",
            position: "주임",
            status: "offline",
            profilePic: null,
        }
    });

    await prisma.user.upsert({
        where: { id: "user-3" },
        update: {},
        create: {
            id: "user-3",
            name: "이유리",
            department: "경영팀",
            position: "대리",
            status: "AFK",
            profilePic: null,
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