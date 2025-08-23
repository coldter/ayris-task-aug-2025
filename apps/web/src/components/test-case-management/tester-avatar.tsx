import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TesterAvatarProps {
  name: string;
  className?: string;
}

export function TesterAvatar({ name, className }: TesterAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-blue-100 font-semibold text-blue-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
