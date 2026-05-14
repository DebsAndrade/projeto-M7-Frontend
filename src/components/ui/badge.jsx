import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-[#504375] text-white',            /* deep purple */
        secondary:   'border-transparent bg-[#FFE8EF] text-[#504375]',       /* pink claro */
        destructive: 'border-transparent bg-red-100 text-red-700',
        success:     'border-transparent bg-[#DDF0E8] text-[#2D7A5A]',       /* sage claro */
        warning:     'border-transparent bg-[#FFE8EF] text-[#C22557]',       /* pink + crimson */
        outline:     'text-[#39324D]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
