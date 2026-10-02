import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:outline-2 focus-visible:outline-primary-focus active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-hover active:bg-primary-focus shadow-none",
        secondary:
          "bg-surface-1 border border-hairline text-ink hover:bg-surface-2 active:bg-surface-3 shadow-none",
        tertiary:
          "bg-transparent text-ink hover:bg-surface-1 active:bg-surface-2 shadow-none",
        outline:
          "border border-hairline bg-transparent text-ink hover:bg-surface-1 active:bg-surface-2 shadow-none",
        ghost:
          "hover:bg-surface-1 hover:text-ink text-ink-muted active:bg-surface-2 shadow-none",
        destructive:
          "bg-destructive/15 text-destructive hover:bg-destructive/25 shadow-none",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3.5 py-2 text-sm gap-1.5",
        xs: "h-6 px-2 text-xs gap-1 rounded-sm",
        sm: "h-7 px-2.5 text-xs gap-1.5 rounded-md",
        lg: "h-9 px-4 py-2 text-sm gap-2 rounded-md",
        icon: "size-8 rounded-md",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
