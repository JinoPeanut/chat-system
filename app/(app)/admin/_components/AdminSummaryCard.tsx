import { LucideIcon } from "lucide-react"
import { formatDiff, getDiffColor } from "./AdminDashboard"

type AdminSummaryCardProps = {
    IconClassName: string,
    Icon: LucideIcon,
    title: string,
    total: number | undefined,
    unit: string,

    description?: string,
    diff?: number,
    diffUnit?: string,
}

export default function AdminSummaryCard({ IconClassName, Icon, title, total, unit, description, diff, diffUnit = "", }: AdminSummaryCardProps) {
    return (
        <div className="flex gap-4 rounded-xl shadow-sm px-6 py-8 bg-white/80">
            <div className={`flex items-center justify-center rounded-lg ${IconClassName} p-4`}>
                <Icon size={30} />
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-gray-500 text-sm font-semibold">{title}</p>
                <div className="flex items-end">
                    <p className="text-2xl font-bold">{total}</p>
                    <span className="font-bold">{unit}</span>
                </div>
                {description && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
                        <p>{description}</p>

                        {diff !== undefined && (
                            <span className={getDiffColor(diff)}>
                                {formatDiff(diff, diffUnit)}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}