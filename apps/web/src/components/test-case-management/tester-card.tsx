import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TestCaseTable } from "./test-case-table";
import { TesterAvatar } from "./tester-avatar";

interface TestCase {
  id: string;
  title: string;
  testerUpdate: string;
  supportUpdate: string;
}

interface Tester {
  id: string;
  name: string;
  email: string;
  testCases: TestCase[];
}

interface TesterCardProps {
  tester: Tester;
  isExpanded?: boolean;
  onToggleExpansion?: (testerId: string) => void;
  onUpdateSupportStatus?: (
    testCaseId: string,
    status:
      | "complete"
      | "passed"
      | "failed"
      | "retest"
      | "na"
      | "pending_validation",
  ) => void;
  onViewTestCase?: (testCaseId: string) => void;
}

export function TesterCard({
  tester,
  isExpanded = false,
  onToggleExpansion,
  onUpdateSupportStatus,
  onViewTestCase,
}: TesterCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between border-border border-b p-4 text-left hover:bg-accent focus:bg-accent focus:outline-none"
        onClick={() => onToggleExpansion?.(tester.id)}
      >
        <div className="flex items-center gap-3">
          <ChevronRight
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              isExpanded && "rotate-90",
            )}
          />
          <div className="flex items-center gap-3">
            <TesterAvatar name={tester.name} />
            <div>
              <h3 className="font-semibold text-foreground">{tester.name}</h3>
              <p className="text-muted-foreground text-sm">{tester.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {tester.testCases.length} test cases
          </Badge>
        </div>
      </button>

      {isExpanded && (
        <TestCaseTable
          testCases={tester.testCases}
          onUpdateSupportStatus={onUpdateSupportStatus}
          onViewTestCase={onViewTestCase}
        />
      )}
    </div>
  );
}
