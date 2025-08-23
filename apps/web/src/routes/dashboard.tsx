import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TesterCard } from "@/components/test-case-management/tester-card";
import { useTestCasesGroupedByTesters } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = Route.useNavigate();

  // State for managing expanded tester cards
  const [expandedTesters, setExpandedTesters] = useState<Set<string>>(
    new Set(),
  );

  // Fetch test cases for supporters
  const {
    data: testCasesData,
    isLoading: isTestCasesLoading,
    error: testCasesError,
  } = useTestCasesGroupedByTesters();

  useEffect(() => {
    if (!session && !isPending) {
      navigate({
        to: "/login",
      });
    }
  }, [session, isPending, navigate]);

  const handleToggleExpansion = (testerId: string) => {
    setExpandedTesters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(testerId)) {
        newSet.delete(testerId);
      } else {
        newSet.add(testerId);
      }
      return newSet;
    });
  };

  const handleUpdateSupportStatus = (testCaseId: string, status: string) => {
    // TODO: Implement API call to update support status
    console.log("Update support status:", testCaseId, status);
  };

  const handleUpdateTestCase = (testCaseId: string, newTitle: string) => {
    // TODO: Implement API call to update test case title
    console.log("Update test case title:", testCaseId, newTitle);
  };

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
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session?.user.role === "support") {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="mb-2 font-bold text-3xl">Test Case Management</h1>
          <p className="text-muted-foreground">
            Manage and review test cases assigned to testers
          </p>
        </div>

        {isTestCasesLoading && (
          <div className="flex justify-center py-8">
            <div>Loading test cases...</div>
          </div>
        )}

        {testCasesError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <h3 className="font-semibold">Error loading test cases</h3>
            <p className="text-sm">{testCasesError.message}</p>
          </div>
        )}

        {!isTestCasesLoading &&
          !testCasesError &&
          (!testCasesData?.testers || testCasesData.testers.length === 0) && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <h3 className="mb-2 font-semibold text-gray-700">
                No test cases found
              </h3>
              <p className="text-gray-600 text-sm">
                There are currently no test cases assigned to any testers.
              </p>
            </div>
          )}

        {!isTestCasesLoading &&
          !testCasesError &&
          testCasesData?.testers &&
          testCasesData.testers.length > 0 && (
            <div className="space-y-4">
              {testCasesData.testers.map((tester) => (
                <TesterCard
                  key={tester.id}
                  tester={tester}
                  isExpanded={expandedTesters.has(tester.id)}
                  onToggleExpansion={handleToggleExpansion}
                  onUpdateSupportStatus={handleUpdateSupportStatus}
                  onUpdateTestCase={handleUpdateTestCase}
                />
              ))}
            </div>
          )}
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
