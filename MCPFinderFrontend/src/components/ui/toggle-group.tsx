import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { cn } from "../../lib/utils"
import { toggleVariants } from "./toggle"

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
})

export interface ToggleGroupProps {
  className?: string
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  children?: React.ReactNode
  type?: "single" | "multiple"
  [key: string]: any
}

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(({ className, variant, size, children, type = "single", ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    type={type}
    {...props}>
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

export interface ToggleGroupItemProps {
  className?: string
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  children?: React.ReactNode
  value: string
  [key: string]: any
}

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, children, variant, size, value, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(toggleVariants({
        variant: context.variant || variant,
        size: context.size || size,
      }), className)}
      value={value}
      {...props}>
      {children}
    </ToggleGroupPrimitive.Item>
  );
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
