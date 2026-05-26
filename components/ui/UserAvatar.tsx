import React from "react";
import { User } from "lucide-react";
import { cn } from "@/utils/cn";

interface UserAvatarProps {
  avatar?: string | null;
  username?: string;
  className?: string;
  fallbackIconClassName?: string;
}

export default function UserAvatar({
  avatar,
  username,
  className = "w-8 h-8 text-xs",
  fallbackIconClassName = "w-1/2 h-1/2",
}: UserAvatarProps) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username || "Avatar"}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold uppercase",
        className
      )}
    >
      {username ? (
        username.charAt(0)
      ) : (
        <User className={fallbackIconClassName} />
      )}
    </div>
  );
}
