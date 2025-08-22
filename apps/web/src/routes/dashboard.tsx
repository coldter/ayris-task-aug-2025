import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();

  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!session && !isPending) {
      navigate({
        to: "/login",
      });
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (session?.user.role === "superadmin") {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-4xl">Welcome, Super Admin! 👋</h1>
          <p className="mb-8 text-muted-foreground text-xl">
            You have full administrative access to manage users and system
            settings.
          </p>
          <div className="mx-auto max-w-2xl rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-8 dark:from-blue-950/20 dark:to-indigo-950/20">
            <h2 className="mb-4 font-semibold text-2xl">
              Administrative Tools
            </h2>
            <div className="grid gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                  👥
                </div>
                <div>
                  <p className="font-medium">User Management</p>
                  <p className="text-muted-foreground text-sm">
                    Navigate to the Testers or Supporters tabs to manage user
                    accounts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                  ⚡
                </div>
                <div>
                  <p className="font-medium">Quick Actions</p>
                  <p className="text-muted-foreground text-sm">
                    Create, edit, and manage tester and support user accounts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                  🔐
                </div>
                <div>
                  <p className="font-medium">Full Access</p>
                  <p className="text-muted-foreground text-sm">
                    Complete administrative privileges across all system
                    functions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-2 font-bold text-2xl">Dashboard</h1>
      <p>Welcome {session?.user.role}</p>
    </div>
  );
}
