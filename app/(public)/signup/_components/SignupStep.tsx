type SignupStepProps = {
    step: 1 | 2 | 3;
}

export default function SignupStep({ step }: SignupStepProps) {
    return (
        <div>
            <div className="rounded-full w-[2rem] h-[2rem] bg-violet-400">

            </div>
            <p>계정 정보</p>
        </div>
    )
}