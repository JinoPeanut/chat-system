import AttendanceSkeleton from "./AttendanceSkeleton";
import LeaveSkeleton from "./LeaveSkeleton";
import ListSkeleton from "./ListSkeleton";
import ProfileSkeleton from "./ProfileSkeleton";

export default function HomeSkeleton() {
    return (
        <div>
            <div className="flex items-end gap-2 px-6 pt-2">
                <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
            </div>

            <div className="grid grid-cols-12 gap-4 p-4">
                <div className="col-span-3">
                    <AttendanceSkeleton />
                    <LeaveSkeleton />
                </div>

                <div className="col-span-6">
                    <ListSkeleton listNumber={3} />
                    <ListSkeleton listNumber={4} />
                </div>

                <div className="col-span-3">
                    <ProfileSkeleton />
                    <ListSkeleton listNumber={3} />
                </div>
            </div>
        </div>
    );
}