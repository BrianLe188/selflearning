import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/admin/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  return (
    <SidebarProvider>
      <AppSidebar userEmail={session.user.email ?? ""} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-semibold text-foreground">Admin</span>
        </header>
        <div className="flex-1 px-6 py-8">
          <div className="mx-auto w-full max-w-[960px]">{children}</div>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
