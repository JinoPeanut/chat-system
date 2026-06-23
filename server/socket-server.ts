import { createServer } from "node:http";
import { Server } from "socket.io";
import { prisma } from "../lib/prisma";

const PORT = Number(process.env.SOCKET_PORT ?? 4000);
const CLIENT_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_ORIGIN,
        credentials: true,
    },
});

const getCookieValue = (cookieHeader: string | undefined, key: string) => {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    const targetCookie = cookies.find((cookie) => cookie.startsWith(`${key}=`));

    return targetCookie ? decodeURIComponent(targetCookie.split("=")[1]) : null;
};

io.on("connection", (socket) => {
    const userId = getCookieValue(socket.handshake.headers.cookie, "auth_user_id");

    if (!userId) {
        socket.emit("error-message", "로그인이 필요합니다.");
        socket.disconnect();
        return;
    }

    socket.on("join-room", async (roomId: string) => {
        const existingChatRoom = await prisma.chatRoom.findFirst({
            where: {
                id: roomId,
                members: {
                    some: {
                        id: userId,
                    },
                },
            },
        });

        if (!existingChatRoom) {
            socket.emit("error-message", "접근할 수 없는 채팅방입니다.");
            return;
        }

        socket.join(roomId);
    });

    socket.on(
        "send-message",
        async ({ chatRoomId, content }: { chatRoomId: string; content: string }) => {
            if (!chatRoomId || !content?.trim()) {
                socket.emit("error-message", "메시지를 입력해주세요.");
                return;
            }

            const existingChatRoom = await prisma.chatRoom.findFirst({
                where: {
                    id: chatRoomId,
                    members: {
                        some: {
                            id: userId,
                        },
                    },
                },
            });

            if (!existingChatRoom) {
                socket.emit("error-message", "메시지를 보낼 수 없는 채팅방입니다.");
                return;
            }

            const message = await prisma.message.create({
                data: {
                    id: crypto.randomUUID(),
                    senderId: userId,
                    chatRoomId,
                    content: content.trim(),
                },
                select: {
                    id: true,
                    senderId: true,
                    chatRoomId: true,
                    content: true,
                    timeAt: true,
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            profilePic: true,
                        }
                    }
                }
            });

            io.to(chatRoomId).emit("new-message", message);
        },
    );
});

httpServer.listen(PORT, () => {
    console.log(`Socket server running on http://localhost:${PORT}`);
});
