import * as React from "react"
import { cn } from "cn"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-2", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        "flex flex-col items-center justify-center w-8.75 h-8.75 gap-2.5 font-mono text-lg font-normal leading-4 select-none transition-colors cursor-pointer rounded border",
        isActive
          ? "bg-primary border-primary text-[#140D0A]"
          : "border-border text-foreground hover:bg-card hover:border-primary px-3 pt-2 pb-2.5",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("p-0 border-border text-foreground hover:border-primary hover:text-primary", className)}
      {...props}
    >
      <ChevronLeftIcon className="w-4.5 h-4.5" />
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("p-0 border-border text-foreground hover:border-primary hover:text-primary", className)}
      {...props}
    >
      <ChevronRightIcon className="w-4.5 h-4.5" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex w-8.75 h-8.75 items-center justify-center font-mono text-lg font-normal text-foreground rounded border border-border", className)}
      {...props}
    >
      <MoreHorizontalIcon className="w-4.5 h-4.5" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
