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
        <thead className="border-gray-200 border-b bg-gray-50">
          <tr>
            <th className="w-32 px-6 py-4 text-left font-semibold text-gray-700 text-sm">
              Test ID
            </th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm">
              Title
            </th>
            <th className="w-40 px-6 py-4 text-left font-semibold text-gray-700 text-sm">
              Tester Status
            </th>
            <th className="w-40 px-6 py-4 text-left font-semibold text-gray-700 text-sm">
              Support Status
            </th>
            <th className="w-32 px-6 py-4 text-left font-semibold text-gray-700 text-sm">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {testCases.map((testCase) => (
            <tr key={testCase.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => onViewTestCase?.(testCase.id)}
                  className="font-mono font-semibold text-blue-600 text-sm hover:text-blue-800 hover:underline"
                >
                  {testCase.id}
                </button>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-900 text-sm">{testCase.title}</span>
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
                  className="p-0 text-blue-600 hover:text-blue-800"
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
