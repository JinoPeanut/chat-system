import SkeletonBox from "./SkeletonBox";

export default function AttendanceSkeleton() {
    return (
        <div className="border border-gray-200 rounded-md px-2 pb-4 shadow-lg min-h-[50%] mb-4">
            <div className="flex flex-col items-start pt-4">
                <SkeletonBox className="w-16 h-3" />
                <SkeletonBox className="w-40 h-2 mt-1" />

                <SkeletonBox className="w-full h-30 mt-2" />

                <SkeletonBox className="w-45 h-3 mt-8" />
                <SkeletonBox className="w-55 h-2 mt-2" />

                <SkeletonBox className="w-full h-2 mt-4" />
                <div className="w-full flex justify-between mt-1">
                    <SkeletonBox className="h-2 w-8" />
                    <SkeletonBox className="h-2 w-8" />
                    <SkeletonBox className="h-2 w-8" />
                </div>

                <div className="w-full flex items-center justify-center gap-4 mt-8">
                    <SkeletonBox className="w-35 h-10" />
                    <SkeletonBox className="w-35 h-10" />
                </div>
            </div>
        </div>
    )
}