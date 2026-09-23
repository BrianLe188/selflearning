import { LogIn } from "lucide-react";
import { signIn, auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function AdminSignInPage({
  searchParams,
}: PageProps<"/admin/sign-in">) {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const { callbackUrl } = await searchParams;
  const redirectTo =
    typeof callbackUrl === "string" && callbackUrl.startsWith("/admin")
      ? callbackUrl
      : "/admin";

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-grow flex-col items-center justify-center px-6 py-20">
      <div className="w-full rounded-md border border-border bg-card p-8 text-center">
        <h1 className="mb-2 text-xl font-bold text-foreground">
          Admin sign in
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Sign in with the allow-listed GitHub account to manage posts.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo });
          }}
        >
          <Button
            type="submit"
            className="h-auto w-full gap-2 rounded-md bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <LogIn className="size-4" />
            Sign in with GitHub
          </Button>
        </form>
      </div>
    </div>
  );
}
