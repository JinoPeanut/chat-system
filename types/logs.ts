export type ActivityLogType = "notice" | "leave" | "default";

export type AdminActivityLog = {
    id: string,
    type: ActivityLogType,
    message: string,
    targetId: string | null,
    targetType: string | null,
    createdAt: string,
    admin: {
        id: string,
        name: string,
        profilePic: string | null,
    },
}

export type AdminActivityLogResponse = {
    logs: AdminActivityLog[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    message?: string;
};