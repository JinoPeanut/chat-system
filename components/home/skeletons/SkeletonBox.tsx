export default function SkeletonBox({ className = "" }: { className?: string }) {
    return (
        <div
            className={`rounded bg-gradient-to-r from-gray-200 
                via-gray-100 to-gray-200 animate-skeleton-shimmer ${className}`} />
    )
}