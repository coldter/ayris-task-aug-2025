import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestCaseHeaderProps {
  onNewTestCase?: () => void;
}

export function TestCaseHeader({ onNewTestCase }: TestCaseHeaderProps) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">
            Test Case Management
          </h1>
          <p className="mt-1 text-gray-600">
            Track and manage test case execution across teams
          </p>
        </div>
        <Button onClick={onNewTestCase} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Test Case
        </Button>
      </div>
    </div>
  );
}
