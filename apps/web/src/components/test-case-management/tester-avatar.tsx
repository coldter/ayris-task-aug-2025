import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TesterAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TesterAvatar({
  name,
  size = "md",
  className,
}: TesterAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className="bg-blue-100 font-semibold text-blue-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
