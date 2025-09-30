import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-800 hover:bg-primary-200",
        success: "bg-success-50 text-success-700 hover:bg-success-100",
        warning: "bg-warning-50 text-warning-700 hover:bg-warning-100",
        danger: "bg-danger-50 text-danger-700 hover:bg-danger-100",
        secondary: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
        outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

