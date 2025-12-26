import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <SignIn />
    </div>
  );
}
