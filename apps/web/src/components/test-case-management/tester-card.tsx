"use client";
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
  onUpdateSupportStatus?: (testCaseId: string, status: string) => void;
  onUpdateTestCase?: (testCaseId: string, newTitle: string) => void;
}

export function TesterCard({
  tester,
  isExpanded = false,
  onToggleExpansion,
  onUpdateSupportStatus,
  onUpdateTestCase,
}: TesterCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between border-gray-200 border-b p-4 text-left hover:bg-gray-50"
        onClick={() => onToggleExpansion?.(tester.id)}
      >
        <div className="flex items-center gap-3">
          <ChevronRight
            className={cn(
              "h-5 w-5 text-gray-400 transition-transform",
              isExpanded && "rotate-90",
            )}
          />
          <div className="flex items-center gap-3">
            <TesterAvatar name={tester.name} />
            <div>
              <h3 className="font-semibold text-gray-900">{tester.name}</h3>
              <p className="text-gray-500 text-sm">{tester.email}</p>
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
          onUpdateTestCase={onUpdateTestCase}
        />
      )}
    </div>
  );
}
