"use client";

import DOMPurify from "dompurify";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  EditIcon,
  SaveIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./status-badge";
import { TesterAvatar } from "./tester-avatar";
import { WysiwygEditor } from "./wysiwyg-editor";

const SanitizedContent = ({ html }: { html: string }) => {
  const sanitizeHtml = (htmlContent: string) => {
    return DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
      ],
      ALLOWED_ATTR: ["class"],
    });
  };

  return (
    <div
      className="prose prose-slate max-w-none text-slate-700 leading-relaxed [&>*]:mb-4 [&>blockquote]:border-blue-300 [&>blockquote]:border-l-4 [&>blockquote]:bg-blue-50/50 [&>blockquote]:py-2 [&>blockquote]:pl-6 [&>blockquote]:italic [&>code]:rounded [&>code]:bg-slate-100 [&>code]:px-2 [&>code]:py-1 [&>code]:text-sm [&>em]:italic [&>h1]:font-bold [&>h1]:text-2xl [&>h1]:text-slate-900 [&>h2]:font-semibold [&>h2]:text-slate-800 [&>h2]:text-xl [&>h3]:font-semibold [&>h3]:text-lg [&>h3]:text-slate-800 [&>ol]:ml-6 [&>ol]:list-decimal [&>p]:mb-3 [&>strong]:font-semibold [&>strong]:text-slate-900 [&>ul]:ml-6 [&>ul]:list-disc"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized with DOMPurify
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(html),
      }}
    />
  );
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TimelineEntry {
  status: string;
  transitionAt: string;
  transitionBy: User;
  comment: string;
}

interface TestCaseDetails {
  id: string;
  title: string;
  description: string;
  testerUpdate: string;
  supportUpdate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  assignedTesters: User[];
  transitionTimeline: TimelineEntry[];
}

interface TestCaseDetailsProps {
  testCase: TestCaseDetails;
  onClose?: () => void;
  onUpdate?: (updatedTestCase: Partial<TestCaseDetails>) => void;
}

export function TestCaseDetails({
  testCase,
  onClose,
  onUpdate,
}: TestCaseDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(testCase.title);
  const [editedDescription, setEditedDescription] = useState(
    testCase.description,
  );
  const [_editedDescriptionJson, setEditedDescriptionJson] = useState<object>(
    {},
  );
  const [editedSupportUpdate, setEditedSupportUpdate] = useState(
    testCase.supportUpdate,
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "initiated":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "complete":
        return "bg-green-100 text-green-800";
      case "passed":
        return "bg-emerald-100 text-emerald-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        title: editedTitle,
        description: editedDescription,
        supportUpdate: editedSupportUpdate,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(testCase.title);
    setEditedDescription(testCase.description);
    setEditedSupportUpdate(testCase.supportUpdate);
    setIsEditing(false);
  };

  const handleDescriptionChange = (html: string, json: object) => {
    setEditedDescription(html);
    setEditedDescriptionJson(json);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="mx-auto max-w-5xl space-y-8 p-6">
        <div className="relative">
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    {onClose && (
                      <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back
                      </Button>
                    )}
                    <Badge
                      variant="outline"
                      className="border-slate-300 bg-slate-100 px-3 py-1 font-mono text-sm"
                    >
                      {testCase.id}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={testCase.testerUpdate} type="tester" />
                    {isEditing ? (
                      <Select
                        value={editedSupportUpdate}
                        onValueChange={setEditedSupportUpdate}
                      >
                        <SelectTrigger className="w-40 border-slate-300 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="complete">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge
                        status={testCase.supportUpdate}
                        type="support"
                      />
                    )}
                  </div>

                  {isEditing ? (
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="border-0 bg-transparent p-0 font-bold text-3xl text-slate-900 focus-visible:ring-0"
                      placeholder="Test case title..."
                    />
                  ) : (
                    <h1 className="font-bold text-3xl text-slate-900 leading-tight">
                      {testCase.title}
                    </h1>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        className="gap-2 bg-blue-600 shadow-md hover:bg-blue-700"
                      >
                        <SaveIcon className="h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="gap-2 border-slate-300 bg-transparent hover:bg-slate-50"
                      >
                        <XIcon className="h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="gap-2 border-slate-300 shadow-sm hover:bg-slate-50"
                    >
                      <EditIcon className="h-4 w-4" />
                      Edit Details
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
                {isEditing ? (
                  <WysiwygEditor
                    content={editedDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Enter detailed test case description..."
                    className="min-h-[200px] bg-white"
                  />
                ) : (
                  <SanitizedContent html={testCase.description} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Timeline Card */}
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 font-semibold text-slate-900 text-xl">
                <div className="rounded-lg bg-blue-100 p-2">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                </div>
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <div className="rounded-full bg-green-100 p-2">
                  <CalendarIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Created</p>
                  <p className="mt-1 text-slate-600 text-sm">
                    {formatDate(testCase.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <div className="rounded-full bg-orange-100 p-2">
                  <CalendarIcon className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Last Updated</p>
                  <p className="mt-1 text-slate-600 text-sm">
                    {formatDate(testCase.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* People Card */}
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 font-semibold text-slate-900 text-xl">
                <div className="rounded-lg bg-purple-100 p-2">
                  <UsersIcon className="h-5 w-5 text-purple-600" />
                </div>
                Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <p className="mb-3 font-medium text-slate-900">Created by</p>
                <div className="flex items-center gap-4">
                  <TesterAvatar name={testCase.createdBy.name} />
                  <div>
                    <p className="font-medium text-slate-900">
                      {testCase.createdBy.name}
                    </p>
                    <p className="text-slate-600 text-sm">
                      {testCase.createdBy.email}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-slate-200 text-slate-700 text-xs"
                    >
                      {testCase.createdBy.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <p className="mb-3 font-medium text-slate-900">
                  Assigned Testers
                </p>
                <div className="space-y-4">
                  {testCase.assignedTesters.map((tester) => (
                    <div key={tester.id} className="flex items-center gap-4">
                      <TesterAvatar name={tester.name} />
                      <div>
                        <p className="font-medium text-slate-900">
                          {tester.name}
                        </p>
                        <p className="text-slate-600 text-sm">{tester.email}</p>
                        <Badge
                          variant="secondary"
                          className="mt-2 bg-slate-200 text-slate-700 text-xs"
                        >
                          {tester.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-semibold text-slate-900 text-xl">
              Status History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {testCase.transitionTimeline.map((entry, index) => (
                <div
                  key={`${entry.transitionAt}-${entry.transitionBy.id}-${index}`}
                  className="flex gap-6"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-4 w-4 rounded-full border-2 border-white shadow-md ${getStatusColor(entry.status).replace("bg-", "bg-").replace("text-", "")}`}
                    />
                    {index < testCase.transitionTimeline.length - 1 && (
                      <div className="mt-3 h-16 w-px bg-gradient-to-b from-slate-300 to-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <Badge
                          className={`${getStatusColor(entry.status)} shadow-sm`}
                        >
                          {entry.status}
                        </Badge>
                        <span className="font-medium text-slate-500 text-sm">
                          {formatDate(entry.transitionAt)}
                        </span>
                      </div>
                      <div className="mb-3 flex items-center gap-3">
                        <TesterAvatar
                          name={entry.transitionBy.name}
                          size="sm"
                        />
                        <span className="font-medium text-slate-900">
                          {entry.transitionBy.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-slate-300 text-slate-600 text-xs"
                        >
                          {entry.transitionBy.role}
                        </Badge>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {entry.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
