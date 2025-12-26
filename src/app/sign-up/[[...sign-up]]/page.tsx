import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <SignUp />
    </div>
  );
}
