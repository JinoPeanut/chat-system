import SkeletonBox from "./SkeletonBox";

export default function ProfileSkeleton() {
    return (
        <div className="border border-gray-200 rounded-xl mb-4 shadow-lg min-h-[45%] p-4">
            <div className="flex flex-col items-center">
                <SkeletonBox className="h-16 w-16 rounded-full" />
                <SkeletonBox className="mt-4 h-4 w-24" />
                <SkeletonBox className="mt-2 h-3 w-16" />
            </div>

            <div className="mt-6 space-y-3">
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-8 w-33 mx-auto rounded-lg" />
                <SkeletonBox className="h-8 w-28 mx-auto rounded-lg" />
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-3/4" />
            </div>
        </div>
    );
}