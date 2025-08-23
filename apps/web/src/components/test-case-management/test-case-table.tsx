import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditableTestCaseTitle } from "./editable-test-case-title";
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
  onUpdateTestCase?: (testCaseId: string, newTitle: string) => void;
}

export function TestCaseTable({
  testCases,
  onUpdateSupportStatus,
  onUpdateTestCase,
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
                <span className="font-mono font-semibold text-blue-600 text-sm">
                  {testCase.id}
                </span>
              </td>
              <td className="px-6 py-4">
                <EditableTestCaseTitle
                  title={testCase.title}
                  testCaseId={testCase.id}
                  onSave={onUpdateTestCase}
                />
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
                >
                  Update
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
