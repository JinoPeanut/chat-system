import SkeletonBox from "./SkeletonBox";

export default function ListSkeleton({ listNumber }: { listNumber: number }) {
    return (
        <div className="border border-gray-200 rounded-md px-2 pb-4 shadow-lg min-h-[30%] mb-4">
            <SkeletonBox className="mt-3 h-4 w-24" />

            <div className="mt-4 space-y-5">
                {Array.from({ length: listNumber }).map((_, index) => (
                    <div key={index} className="rounded-md border border-gray-100 p-3">
                        <SkeletonBox className="h-4 w-32" />
                        <SkeletonBox className="mt-2 h-3 w-48" />
                    </div>
                ))}
            </div>
        </div>
    );
}