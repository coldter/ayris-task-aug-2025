import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateTestCase } from "@/components/test-case-management/create-test-case";
import { TestCaseDetails } from "@/components/test-case-management/test-case-details";
import { TestCaseHeader } from "@/components/test-case-management/test-case-header";
import { TesterCard } from "@/components/test-case-management/tester-card";
import {
  useAvailableTesters,
  useCreateTestCase,
  useTestCaseDetails,
  useTestCasesGroupedByTesters,
} from "@/lib/api";
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

  // State for create test case modal
  const [showCreateTestCase, setShowCreateTestCase] = useState(false);

  // State for selected test case view
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(
    null,
  );

  // Fetch test cases for supporters
  const {
    data: testCasesData,
    isLoading: isTestCasesLoading,
    error: testCasesError,
  } = useTestCasesGroupedByTesters();

  // Fetch available testers for test case creation
  const { data: availableTestersData } = useAvailableTesters();

  // Create test case mutation
  const createTestCaseMutation = useCreateTestCase();

  // Fetch test case details when a test case is selected
  const { data: testCaseDetailsData, isLoading: isTestCaseDetailsLoading } =
    useTestCaseDetails(selectedTestCaseId || "");

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

  const handleNewTestCase = () => {
    setShowCreateTestCase(true);
  };

  const handleCreateTestCase = async (testCase: {
    title: string;
    testerIds: string[];
    description: string;
    descriptionJson: object;
  }) => {
    try {
      await createTestCaseMutation.mutateAsync({
        title: testCase.title,
        testerIds: testCase.testerIds,
        description: testCase.description,
      });

      toast.success("Test case created successfully!");
      setShowCreateTestCase(false);
    } catch (error) {
      console.error("Failed to create test case:", error);
      toast.error("Failed to create test case. Please try again.");
    }
  };

  const handleCancelCreate = () => {
    setShowCreateTestCase(false);
  };

  const handleViewTestCase = (testCaseId: string) => {
    setSelectedTestCaseId(testCaseId);
  };

  const handleCloseTestCaseDetails = () => {
    setSelectedTestCaseId(null);
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
    // Show test case details if a test case is selected
    if (selectedTestCaseId) {
      if (isTestCaseDetailsLoading) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div>Loading test case details...</div>
          </div>
        );
      }

      if (testCaseDetailsData) {
        return (
          <TestCaseDetails
            testCase={testCaseDetailsData}
            onClose={handleCloseTestCaseDetails}
          />
        );
      }
    }

    // Show create test case form if in create mode
    if (showCreateTestCase) {
      return (
        <CreateTestCase
          onSubmit={handleCreateTestCase}
          onCancel={handleCancelCreate}
          availableTesters={availableTestersData?.testers || []}
          isLoading={createTestCaseMutation.isPending}
        />
      );
    }

    return (
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <TestCaseHeader onNewTestCase={handleNewTestCase} />

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
                  onViewTestCase={handleViewTestCase}
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
