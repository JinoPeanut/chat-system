import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const NOTICE_CATEGORIES = ["notice", "event", "update", "etc"] as const;


export async function GET(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, },
    });

    if (!currentUser) {
        return NextResponse.json(
            { message: "사용자를 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 7)));

    const category = searchParams.get("category");
    const keyword = searchParams.get("keyword")?.trim();

    const skip = (page - 1) * limit;

    const where: Prisma.NoticeWhereInput = {
        author: {
            companyId: currentUser.companyId,
        }
    }

    if (category && NOTICE_CATEGORIES.includes(category as typeof NOTICE_CATEGORIES[number])) {
        where.category = category as typeof NOTICE_CATEGORIES[number];
    }

    if (keyword) {
        where.OR = [
            { title: { contains: keyword, mode: "insensitive" } },
            { content: { contains: keyword, mode: "insensitive" } },
            { author: { name: { contains: keyword, mode: "insensitive" } } },
        ];
    }

    const total = await prisma.notice.count({
        where,
    });

    const notice = await prisma.notice.findMany({
        where,
        include: { author: true, attachments: true },
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
    });

    return NextResponse.json({
        notices: notice,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    });
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const category = formData.get("category");
    const content = formData.get("content");
    const isPinned = formData.get("isPinned");
    const files = formData.getAll("files");

    if (typeof title !== "string" || typeof category !== "string") {
        return NextResponse.json(
            { message: "제목과 카테고리는 필수입니다." },
            { status: 400 },
        )
    }

    if (!title.trim() || !category.trim()) {
        return NextResponse.json(
            { message: "제목과 카테고리는 필수입니다." },
            { status: 400 },
        )
    }

    const contentValue = typeof content === "string" ? content : null;
    const isPinnedValue = isPinned === "true";

    if (!NOTICE_CATEGORIES.includes(category as typeof NOTICE_CATEGORIES[number])) {
        return NextResponse.json(
            { message: "올바르지 않은 카테고리 입니다" },
            { status: 400 }
        )
    }

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!existingUser) {
        return NextResponse.json(
            { message: "사용자를 찾을 수 없습니다." },
            { status: 404 },
        )
    }

    const notice = await prisma.notice.create({
        data: {
            id: crypto.randomUUID(),
            title: title.trim(),
            content: contentValue,
            category: category as typeof NOTICE_CATEGORIES[number],
            isPinned: isPinnedValue,
            authorId: userId,
        },
        include: {
            author: true,
        }
    })

    const uploadedFiles = files.filter((file): file is File => file instanceof File);

    if (uploadedFiles.length > 0) {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "notices");

        await mkdir(uploadDir, { recursive: true });

        await Promise.all(
            uploadedFiles.map(async (file) => {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const safeFileName = `${crypto.randomUUID()}-${file.name}`;
                const filePath = path.join(uploadDir, safeFileName);

                await writeFile(filePath, buffer);

                await prisma.noticeAttachment.create({
                    data: {
                        noticeId: notice.id,
                        fileName: file.name,
                        fileUrl: `/uploads/notices/${safeFileName}`,
                        fileSize: file.size,
                        fileType: file.type,
                    }
                })
            })
        )
    }

    return NextResponse.json(notice, { status: 201 });
}

export async function PATCH(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const body = await request.json();

    if (!body.id) {
        return NextResponse.json(
            { message: "게시글 id 가 필요합니다" },
            { status: 400 }
        )
    }

    const updateData: Prisma.NoticeUpdateInput = {};

    if (body.title !== undefined) {
        updateData.title = body.title;
    }

    if (body.content !== undefined) {
        updateData.content = body.content;
    }

    if (body.category !== undefined) {
        updateData.category = body.category;
    }

    if (body.isPinned !== undefined) {
        updateData.isPinned = body.isPinned;
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
            { message: "수정할 값이 없습니다." },
            { status: 400 }
        );
    }

    const existingNotice = await prisma.notice.findFirst({
        where: { id: body.id, authorId: userId }
    })

    if (!existingNotice) {
        return NextResponse.json(
            { message: "수정할 수 없는 게시물 입니다." },
            { status: 404 },
        )
    }

    const updateNotice = await prisma.notice.update({
        where: { id: body.id },
        data: updateData,
        include: { author: true },
    });

    return NextResponse.json(updateNotice);
}

export async function DELETE(request: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user_id")?.value;

    if (!userId) {
        return NextResponse.json(
            { message: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const body = await request.json();

    if (!body) {
        return NextResponse.json(
            { message: "게시글 아이디가 필요합니다." },
            { status: 400 }
        )
    }

    const existingNotice = await prisma.notice.findFirst({
        where: { id: body.id, authorId: userId },
    });

    if (!existingNotice) {
        return NextResponse.json(
            { message: "삭제할 수 없는 게시물 입니다." },
            { status: 404 },
        )
    }

    const notice = await prisma.notice.delete({
        where: { id: body.id }
    });

    return NextResponse.json(notice);
}
