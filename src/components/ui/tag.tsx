import * as React from "react"
import { cn } from "@/lib/utils"

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline"
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
          variant === "default" && "bg-black text-white dark:bg-white dark:text-black",
          variant === "outline" && "border border-border text-text",
          className
        )}
        {...props}
      />
    )
  }
)
Tag.displayName = "Tag"

export { Tag }
