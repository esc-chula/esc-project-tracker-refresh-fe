"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const frameClassName =
  "rounded-[20px] border border-transparent p-[2px] transition-colors duration-150 focus-within:border-carmine";
const inputClassName =
  "h-[52px] rounded-[18px] border border-gray-300 px-5 text-base text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";
const textareaClassName =
  "min-h-[180px] rounded-[18px] border border-gray-300 px-5 py-4 text-base text-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";
const selectClassName =
  "h-[52px] w-full appearance-none rounded-[18px] border border-gray-300 bg-white px-5 pr-12 text-base text-black outline-none";

export function FormFieldFrame({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(frameClassName, className)}>{children}</div>;
}

export const FormInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    return (
      <FormFieldFrame>
        <Input ref={ref} className={cn(inputClassName, className)} {...props} />
      </FormFieldFrame>
    );
  }
);

FormInput.displayName = "FormInput";

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof Textarea>>(
  ({ className, ...props }, ref) => {
    return (
      <FormFieldFrame>
        <Textarea ref={ref} className={cn(textareaClassName, className)} {...props} />
      </FormFieldFrame>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

type FormSelectProps = React.ComponentProps<"select">;

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <FormFieldFrame>
        <div className="relative">
          <select ref={ref} className={cn(selectClassName, className)} {...props}>
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
        </div>
      </FormFieldFrame>
    );
  }
);

FormSelect.displayName = "FormSelect";
