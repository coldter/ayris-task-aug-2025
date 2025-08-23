"use client";

import { Edit2, Save, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditableTestCaseTitleProps {
  title: string;
  testCaseId: string;
  onSave?: (id: string, newTitle: string) => void;
}

export function EditableTestCaseTitle({
  title,
  testCaseId,
  onSave,
}: EditableTestCaseTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleSave = () => {
    onSave?.(testCaseId, editTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(title);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="flex-1"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          className="text-green-600 hover:bg-green-50"
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          className="text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-start justify-between">
      <span className="text-gray-900 text-sm leading-relaxed">{title}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 group-hover:opacity-100"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
