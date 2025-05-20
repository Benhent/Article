import React from "react";
import { cn } from "../../lib/utils";

export const Timeline = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("relative ml-4", className)}>{children}</div>;
};

export const TimelineItem = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("mb-6 flex", className)}>{children}</div>;
};

export const TimelineSeparator = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("flex flex-col items-center", className)}>{children}</div>;
};

export const TimelineConnector = ({ className }: { className?: string }) => {
  return <div className={cn("w-0.5 h-full bg-gray-200 my-1", className)}></div>;
};

export const TimelineContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("flex-1", className)}>{children}</div>;
};

export const TimelineDot = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", className)}>
      {children}
    </div>
  );
};