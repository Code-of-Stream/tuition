import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  error?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={twMerge(
          "block text-sm font-medium text-gray-700",
          error ? "text-red-600" : undefined,
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";
