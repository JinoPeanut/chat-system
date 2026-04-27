import { LucideIcon } from "lucide-react"

type LeaveSummaryCardProps = {
    LucideIcon: LucideIcon,
    title: string,
    days: number,
    hours?: number,
}

export default function LeaveSummaryCard({ LucideIcon, title, days, hours }: LeaveSummaryCardProps) {
    return (
        <div className="col-span-1 flex flex-col items-start bg-gray-300/80
                    rounded-md h-[7rem] p-2 group hover:bg-blue-200"
        >
            <LucideIcon size={26} className="text-gray-400 group-hover:text-blue-500" />
            <p className="text-xs leading-tight pt-5 text-gray-500 font-bold
                        group-hover:text-blue-500
                    ">
                {title}
            </p>
            <p className="font-bold">
                {Math.floor(days)}일
            </p>
            <p className="text-xs leading-tight text-gray-500 group-hover:text-blue-500">
                {hours !== undefined ? `${hours}시간` : ""}
            </p>
        </div>
    )
}