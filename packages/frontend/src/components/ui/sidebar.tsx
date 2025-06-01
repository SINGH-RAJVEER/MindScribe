import * as React from "react"
import { cn } from "./utils"

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean
  onCollapse?: () => void
}

export function Sidebar({
  className,
  children,
  collapsed = false,
  onCollapse,
  ...props
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-full bg-card border-r flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        className
      )}
      style={{ minWidth: collapsed ? "4rem" : "16rem", maxWidth: collapsed ? "4rem" : "16rem" }}
      {...props}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <span className="font-bold text-lg">Chats</span>}
        <button
          onClick={onCollapse}
          className="ml-auto text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>
          )}
        </button>
      </div>
      <div className={cn("flex-1 overflow-y-auto transition-opacity duration-200", collapsed ? "opacity-0 pointer-events-none" : "opacity-100")}>{children}</div>
    </aside>
  )
}
