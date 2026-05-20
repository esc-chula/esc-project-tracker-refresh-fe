"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

type CancelButtonProps = Omit<ButtonProps, "variant">;

const CancelButton = React.forwardRef<HTMLButtonElement, CancelButtonProps>(
  ({ children = "ยกเลิก", className, type = "button", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type={type}
        variant="outline"
        className={cn(
          "h-12 rounded-2xl border-gray-400 px-6 text-base font-medium text-gray-600 hover:bg-gray-50",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

CancelButton.displayName = "CancelButton";

export { CancelButton };
