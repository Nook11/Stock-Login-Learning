import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/80",
        destructive: "bg-red-600 text-white shadow-xs hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500/20",
        outline:
          "border border-input bg-background shadow-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 active:bg-blue-100",
        secondary: "bg-blue-100 text-blue-800 shadow-xs hover:bg-blue-200 active:bg-blue-300",
        ghost: "hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 active:text-blue-800",
        success:
          "bg-green-600 text-white shadow-xs hover:bg-green-700 active:bg-green-800 focus-visible:ring-green-500/20",
        warning:
          "bg-orange-600 text-white shadow-xs hover:bg-orange-700 active:bg-orange-800 focus-visible:ring-orange-500/20",
        info: "bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500/20",
        purple:
          "bg-purple-600 text-white shadow-xs hover:bg-purple-700 active:bg-purple-800 focus-visible:ring-purple-500/20",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
