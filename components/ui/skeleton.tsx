import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular"
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "rounded-md",
      text: "rounded-sm",
      circular: "rounded-full"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-muted",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
