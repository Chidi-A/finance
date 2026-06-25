import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  asLink?: boolean
}

export function Logo({ className, asLink = true }: LogoProps) {
  const content = (
    <div className="pl-6 group-data-[collapsible=icon]:pl-0">
      <img
        src="/assets/images/logo-large.svg"
        alt="Finance"
        className={cn("group-data-[collapsible=icon]:hidden", className)}
      />
      <img
        src="/assets/images/logo-small.svg"
        alt="Finance"
        className={cn("hidden group-data-[collapsible=icon]:block", className)}
      />
    </div>
  )

  if (!asLink) return content

  return <Link to="/">{content}</Link>
}
