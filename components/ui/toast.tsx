import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info"
  duration?: number
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", duration = 5000, ...props }, ref) => {
    const variantClasses = {
      default: "bg-background text-foreground border",
      success: "bg-success text-white border-success",
      warning: "bg-warning text-white border-warning", 
      error: "bg-error text-white border-error",
      info: "bg-info text-white border-info"
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription"

export { Toast, ToastTitle, ToastDescription }
