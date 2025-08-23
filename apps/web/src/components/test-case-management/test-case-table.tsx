"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./status-badge";

interface TestCase {
  id: string;
  title: string;
  testerUpdate: string;
  supportUpdate: string;
}

interface TestCaseTableProps {
  testCases: TestCase[];
  onUpdateSupportStatus?: (testCaseId: string, status: string) => void;
  onViewTestCase?: (testCaseId: string) => void;
}

export function TestCaseTable({
  testCases,
  onUpdateSupportStatus,
  onViewTestCase,
}: TestCaseTableProps) {
  return (
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
              Tester Status
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
          {testCases.map((testCase) => (
            <tr key={testCase.id} className="hover:bg-muted/50">
              <td className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => onViewTestCase?.(testCase.id)}
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
                <StatusBadge status={testCase.testerUpdate} />
              </td>
              <td className="px-6 py-4">
                <Select
                  defaultValue={testCase.supportUpdate}
                  onValueChange={(value) =>
                    onUpdateSupportStatus?.(testCase.id, value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-6 py-4">
                <Button
                  variant="link"
                  className="p-0 text-primary hover:text-primary/80"
                  onClick={() => onViewTestCase?.(testCase.id)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
