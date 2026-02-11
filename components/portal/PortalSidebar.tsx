"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const icons = {
  profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  connections: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const NAV_ITEMS: NavItem[] = [
  { label: "Profile", href: "/portal/profile", icon: icons.profile },
  { label: "My Connections", href: "/portal/connections", icon: icons.connections },
  { label: "Account Settings", href: "/portal/settings", icon: icons.settings },
];

export default function PortalSidebar() {
  const pathname = usePathname();

  const renderNavLink = (item: NavItem, compact = false) => {
    const isActive = pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={[
          compact
            ? "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium min-w-[64px] min-h-[44px] justify-center"
            : "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[44px]",
          isActive
            ? compact ? "text-primary-600" : "bg-primary-50 text-primary-700"
            : compact ? "text-gray-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        ].join(" ")}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => renderNavLink(item))}
          </div>
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map((item) => renderNavLink(item, true))}
        </div>
      </nav>
    </>
  );
}
