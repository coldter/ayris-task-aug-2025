import { useQueryClient } from "@tanstack/react-query";
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
  useTesterTestCases,
  useUpdateTestCaseDetails,
  useUpdateTestCaseSupportStatus,
  useUpdateTestCaseTesterStatus,
} from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

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

  // Conditionally fetch data based on user role
  const isSupporter =
    session?.user.role === "support" || session?.user.role === "superadmin";
  const isTester = session?.user.role === "tester";

  // Fetch test cases for supporters
  const {
    data: testCasesData,
    isLoading: isTestCasesLoading,
    error: testCasesError,
  } = useTestCasesGroupedByTesters({
    enabled: isSupporter,
  });

  // Set all tester cards to expanded when data is loaded
  useEffect(() => {
    if (testCasesData?.testers) {
      const allTesterIds = new Set(
        testCasesData.testers.map((tester) => tester.id),
      );
      setExpandedTesters(allTesterIds);
    }
  }, [testCasesData]);

  // Fetch available testers for test case creation (only for supporters)
  const { data: availableTestersData } = useAvailableTesters({
    enabled: isSupporter,
  });

  // Create test case mutation (only for supporters)
  const createTestCaseMutation = useCreateTestCase();

  // Update test case support status mutation (only for supporters)
  const updateSupportStatusMutation = useUpdateTestCaseSupportStatus();

  // Update test case details mutation (only for supporters)
  const updateTestCaseDetailsMutation = useUpdateTestCaseDetails();

  // Update test case tester status mutation
  const updateTesterStatusMutation = useUpdateTestCaseTesterStatus();

  // Fetch test case details when a test case is selected
  const { data: testCaseDetailsData, isLoading: isTestCaseDetailsLoading } =
    useTestCaseDetails(selectedTestCaseId || "");

  // Fetch test cases for testers
  const {
    data: testerTestCasesData,
    isLoading: isTesterTestCasesLoading,
    error: testerTestCasesError,
  } = useTesterTestCases({
    enabled: isTester,
  });

  // Store the current user ID to detect user changes
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!session && !isPending) {
      navigate({
        to: "/login",
      });
    }
  }, [session, isPending, navigate]);

  // Clear cache when user changes
  useEffect(() => {
    if (session?.user?.id) {
      if (currentUserId && currentUserId !== session.user.id) {
        // User has changed, clear all cached data
        queryClient.clear();
        setSelectedTestCaseId(null);
        setShowCreateTestCase(false);
        setExpandedTesters(new Set());
      }
      setCurrentUserId(session.user.id);
    } else if (!session && currentUserId) {
      // User signed out, clear cache
      queryClient.clear();
      setCurrentUserId(null);
      setSelectedTestCaseId(null);
      setShowCreateTestCase(false);
      setExpandedTesters(new Set());
    }
  }, [session?.user?.id, currentUserId, queryClient, session]);

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

  const handleUpdateSupportStatus = async (
    testCaseId: string,
    status:
      | "complete"
      | "passed"
      | "failed"
      | "retest"
      | "na"
      | "pending_validation",
  ) => {
    try {
      await updateSupportStatusMutation.mutateAsync({
        testCaseId,
        supportUpdate: status,
      });

      toast.success("Support status updated successfully!");
    } catch (error) {
      console.error("Failed to update support status:", error);
      toast.error("Failed to update support status. Please try again.");
    }
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

  const handleUpdateTestCaseDetails = async (updatedTestCase: {
    title?: string;
    description?: string;
    supportUpdate?: string;
  }) => {
    if (!selectedTestCaseId) return;

    try {
      await updateTestCaseDetailsMutation.mutateAsync({
        testCaseId: selectedTestCaseId,
        title: updatedTestCase.title || "",
        description: updatedTestCase.description || "",
        supportUpdate: updatedTestCase.supportUpdate as
          | "complete"
          | "passed"
          | "failed"
          | "retest"
          | "na"
          | "pending_validation"
          | undefined,
      });

      toast.success("Test case updated successfully!");
    } catch (error) {
      console.error("Failed to update test case:", error);
      toast.error("Failed to update test case. Please try again.");
    }
  };

  const handleUpdateTesterStatus = async (
    testCaseId: string,
    status: "pending" | "complete",
  ) => {
    try {
      await updateTesterStatusMutation.mutateAsync({
        testCaseId,
        testerUpdate: status,
      });

      toast.success("Tester status updated successfully!");
    } catch (error) {
      console.error("Failed to update tester status:", error);
      toast.error("Failed to update tester status. Please try again.");
    }
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
            onUpdate={
              session?.user.role === "support"
                ? handleUpdateTestCaseDetails
                : undefined
            }
            onUpdateSupportStatus={
              session?.user.role === "support"
                ? handleUpdateSupportStatus
                : undefined
            }
            onUpdateTesterStatus={handleUpdateTesterStatus}
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

  if (session?.user.role === "tester") {
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
            onUpdateTesterStatus={handleUpdateTesterStatus}
          />
        );
      }
    }

    return (
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="mb-2 font-bold text-2xl">My Test Cases</h1>
          <p className="text-muted-foreground">
            View and update status of test cases assigned to you
          </p>
        </div>

        {isTesterTestCasesLoading && (
          <div className="flex justify-center py-8">
            <div>Loading test cases...</div>
          </div>
        )}

        {testerTestCasesError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <h3 className="font-semibold">Error loading test cases</h3>
            <p className="text-sm">{testerTestCasesError.message}</p>
          </div>
        )}

        {!isTesterTestCasesLoading &&
          !testerTestCasesError &&
          (!testerTestCasesData?.testCases ||
            testerTestCasesData.testCases.length === 0) && (
            <div className="rounded-lg border border-border bg-muted p-8 text-center">
              <h3 className="mb-2 font-semibold text-foreground">
                No test cases assigned
              </h3>
              <p className="text-muted-foreground text-sm">
                You currently have no test cases assigned to you.
              </p>
            </div>
          )}

        {!isTesterTestCasesLoading &&
          !testerTestCasesError &&
          testerTestCasesData?.testCases &&
          testerTestCasesData.testCases.length > 0 && (
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-border border-b bg-muted/50">
                    <tr>
                      <th className="w-32 px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Test ID
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Title
                      </th>
                      <th className="w-40 px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Status
                      </th>
                      <th className="w-40 px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Support Status
                      </th>
                      <th className="w-32 px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {testerTestCasesData.testCases.map((testCase) => (
                      <tr key={testCase.id} className="hover:bg-accent">
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleViewTestCase(testCase.id)}
                            className="font-mono font-semibold text-primary text-sm hover:text-primary/80 hover:underline"
                          >
                            {testCase.id}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-foreground text-sm">
                            {testCase.title}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={testCase.testerUpdate}
                            onChange={(e) =>
                              handleUpdateTesterStatus(
                                testCase.id,
                                e.target.value as "pending" | "complete",
                              )
                            }
                            className="rounded border border-border bg-background px-3 py-1 text-sm focus:border-primary focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="complete">Complete</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="rounded-full bg-muted px-2 py-1 text-center text-muted-foreground text-xs">
                            {testCase.supportUpdate
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleViewTestCase(testCase.id)}
                            className="text-primary text-sm hover:text-primary/80 hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
