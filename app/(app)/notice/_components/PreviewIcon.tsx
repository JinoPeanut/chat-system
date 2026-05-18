export default function PreviewIcon() {
    return (
        <div className="relative w-24 h-24 mx-auto text-violet-400">

            <svg
                className="w-24 h-24"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    x="28"
                    y="18"
                    width="52"
                    height="70"
                    rx="8"
                    fill="#F5F3FF"
                    stroke="#C4B5FD"
                    strokeWidth="4"
                />

                <path
                    d="M42 38H66"
                    stroke="#8B5CF6"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    d="M42 52H68"
                    stroke="#A78BFA"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    d="M42 66H60"
                    stroke="#C4B5FD"
                    strokeWidth="4"
                    strokeLinecap="round"
                />

                <circle
                    cx="78"
                    cy="72"
                    r="15"
                    fill="#FFFFFF"
                    stroke="#8B5CF6"
                    strokeWidth="5"
                />
                <path
                    d="M89 83L101 95"
                    stroke="#8B5CF6"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    )
}