import SkeletonBox from "./SkeletonBox";

export default function LeaveSkeleton() {
    return (
        <div className="border border-gray-200 rounded-md px-2 shadow-lg min-h-[45%] py-3">
            <div className="flex flex-col items-start">
                <SkeletonBox className="w-16 h-3" />
                <div className="w-full grid grid-cols-3 gap-2 mt-4">
                    <SkeletonBox className="w-full h-35" />
                    <SkeletonBox className="w-full h-35" />
                    <SkeletonBox className="w-full h-35" />
                </div>
                <SkeletonBox className="mx-auto w-[70%] h-4 mt-3" />
                <SkeletonBox className="w-full h-2 mt-3" />

                <div className="w-full flex items-center justify-center gap-4 mt-6">
                    <SkeletonBox className="w-35 h-10" />
                    <SkeletonBox className="w-35 h-10" />
                </div>
            </div>
        </div>
    )
}