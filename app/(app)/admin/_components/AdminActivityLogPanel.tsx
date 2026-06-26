"use client"

import { AdminActivityLog } from "@/types/logs";
import { getActivityIcon } from "@/utils/logUtils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminActivityLogPanel() {
    const [logs, setLogs] = useState<AdminActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const LIMIT = 5;

    const fetchActivityLogs = async () => {

        setErrorMessage("");

        const params = new URLSearchParams({
            limit: String(LIMIT),
        });

        try {
            setIsLoading(true);

            const res = await fetch(`/api/admin/activity-logs?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.message ?? "활동 로그를 불러오지 못했습니다.");
                return;
            }

            setLogs(data.logs);
        } catch (error) {
            setErrorMessage("서버와 연결할 수 없습니다.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchActivityLogs();
    }, [])

    return (
        <div className="flex flex-col gap-1 w-full bg-white/80 p-8 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
                <p className="text-base tracking-tight font-semibold">최근 활동 로그</p>

                <Link
                    href={`/admin/activity-logs`}
                    className="flex gap-3 items-center justify-between border border-gray-300 text-gray-500 rounded-lg px-4 py-2 cursor-pointer
                        hover:bg-gray-100"
                >
                    <p className="text-sm">전체 보기</p>
                    <ChevronRight size={18} />
                </Link>
            </div>



            {isLoading && (
                <p className="text-sm text-gray-400">활동 로그를 불러오는 중입니다...</p>
            )}

            {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
            )}

            {!isLoading && !errorMessage && logs.length === 0 && (
                <p className="text-sm text-gray-400">최근 활동 로그가 없습니다.</p>
            )}

            {!isLoading && !errorMessage && logs.map((log, index) => {
                const Icon = getActivityIcon(log.type);
                const isLast = index === logs.length - 1;

                return (
                    <div key={log.id} className="flex flex-col">
                        <div className="flex items-center justify-between px-2 py-3">
                            <div className="flex items-center justify-center gap-2">
                                <Icon
                                    size={14}
                                    className="w-9 h-9 text-gray-500 bg-gray-100 rounded-full p-2"
                                />
                                <p className="text-gray-600 font-semibold text-sm">
                                    {log.message}
                                </p>
                            </div>

                            <p className="text-gray-600 font-semibold text-sm">
                                {new Date(log.createdAt).toLocaleString("ko-KR")}
                            </p>
                        </div>

                        {!isLast && <span className="h-[1px] w-full bg-gray-200" />}
                    </div>
                );
            })}
        </div>
    )
}