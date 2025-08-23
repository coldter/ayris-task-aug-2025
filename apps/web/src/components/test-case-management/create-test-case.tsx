import {
  ArrowLeftIcon,
  Check,
  ChevronsUpDown,
  Mail,
  Plus,
  User,
  X,
} from "lucide-react";
import type React from "react";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { WysiwygEditor } from "./wysiwyg-editor";

interface Tester {
  id: string;
  name: string;
  email: string;
}

interface CreateTestCaseProps {
  onSubmit: (testCase: {
    title: string;
    testerIds: string[];
    description: string;
    descriptionJson: object;
  }) => void;
  onCancel: () => void;
  availableTesters?: Tester[];
  isLoading?: boolean;
}

export function CreateTestCase({
  onSubmit,
  onCancel,
  availableTesters = [],
  isLoading = false,
}: CreateTestCaseProps) {
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [selectedTesterIds, setSelectedTesterIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [descriptionJson, setDescriptionJson] = useState<object>({});
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    testerIds?: string;
    description?: string;
  }>({});

  // Mock data for demonstration - in real app this would come from props
  const mockTesters: Tester[] =
    availableTesters.length > 0
      ? availableTesters
      : [
          { id: "tester1", name: "John Doe", email: "john@example.com" },
          { id: "tester2", name: "Jane Smith", email: "jane@example.com" },
          { id: "tester3", name: "Mike Johnson", email: "mike@example.com" },
          { id: "tester4", name: "Sarah Wilson", email: "sarah@example.com" },
        ];

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (selectedTesterIds.length === 0) {
      newErrors.testerIds = "At least one tester must be selected";
    }

    if (!description.trim() || description === "<p></p>") {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      testerIds: selectedTesterIds,
      description,
      descriptionJson,
    });
  };

  const handleTesterSelect = (testerId: string) => {
    if (selectedTesterIds.includes(testerId)) {
      setSelectedTesterIds(selectedTesterIds.filter((id) => id !== testerId));
    } else {
      setSelectedTesterIds([...selectedTesterIds, testerId]);
    }
    setErrors({ ...errors, testerIds: undefined });
  };

  const removeTester = (testerId: string) => {
    setSelectedTesterIds(selectedTesterIds.filter((id) => id !== testerId));
  };

  const getSelectedTesters = () => {
    return mockTesters.filter((tester) =>
      selectedTesterIds.includes(tester.id),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="mx-auto max-w-5xl space-y-8 p-6">
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={onCancel}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                  </Button>
                </div>
                <h1 className="font-bold text-3xl text-slate-900 leading-tight">
                  Create New Test Case
                </h1>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Field */}
              <div className="space-y-3">
                <Label
                  htmlFor={titleId}
                  className="font-medium text-slate-700 text-sm"
                >
                  Test Case Title *
                </Label>
                <Input
                  id={titleId}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors({ ...errors, title: undefined });
                  }}
                  placeholder="Enter test case title..."
                  className={cn(
                    "border-slate-300 transition-all duration-200 focus:border-blue-500",
                    errors.title ? "border-red-500 focus:border-red-500" : "",
                  )}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm">{errors.title}</p>
                )}
              </div>

              {/* Tester Selection */}
              <div className="space-y-4">
                <Label className="font-medium text-slate-700 text-sm">
                  Assign Testers * (Minimum 1 required)
                </Label>

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between border-slate-300 shadow-sm transition-all duration-200 hover:bg-slate-50",
                        errors.testerIds
                          ? "border-red-500"
                          : "hover:border-blue-500",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        {selectedTesterIds.length === 0
                          ? "Select testers..."
                          : `${selectedTesterIds.length} tester${selectedTesterIds.length > 1 ? "s" : ""} selected`}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search testers..." />
                      <CommandList>
                        <CommandEmpty>No testers found.</CommandEmpty>
                        <CommandGroup>
                          {mockTesters.map((tester) => (
                            <CommandItem
                              key={tester.id}
                              value={`${tester.name} ${tester.email}`}
                              onSelect={() => handleTesterSelect(tester.id)}
                              className="flex items-center gap-3 p-3"
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  selectedTesterIds.includes(tester.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-1 items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 font-medium text-sm text-white">
                                  {tester.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-900">
                                    {tester.name}
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-600 text-sm">
                                    <Mail className="h-3 w-3" />
                                    {tester.email}
                                  </span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Selected Testers Display */}
                {selectedTesterIds.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                    <div className="flex flex-wrap gap-2">
                      {getSelectedTesters().map((tester) => (
                        <Badge
                          key={tester.id}
                          variant="secondary"
                          className="flex items-center gap-2 bg-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-300"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 font-medium text-white text-xs">
                            {tester.name.charAt(0)}
                          </div>
                          <span className="font-medium">{tester.name}</span>
                          <button
                            type="button"
                            onClick={() => removeTester(tester.id)}
                            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-slate-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {errors.testerIds && (
                  <p className="text-red-600 text-sm">{errors.testerIds}</p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="description"
                  className="font-medium text-slate-700 text-sm"
                >
                  Test Case Description *
                </Label>
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
                  <WysiwygEditor
                    content={description}
                    onChange={(html, json) => {
                      setDescription(html);
                      setDescriptionJson(json);
                      setErrors({ ...errors, description: undefined });
                    }}
                    placeholder="Enter detailed test case description..."
                    className={cn(
                      "min-h-[200px] bg-white transition-all duration-200",
                      errors.description
                        ? "border-red-500"
                        : "focus-within:border-blue-500",
                    )}
                  />
                </div>
                {errors.description && (
                  <p className="text-red-600 text-sm">{errors.description}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-slate-200 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="border-slate-300 bg-transparent px-6 shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 px-6 shadow-md hover:bg-blue-700"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Test Case
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
