import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tool } from "@/lib/types";

async function fetchTools(): Promise<Tool[]> {
  const response = await fetch('/api/tools?is_active=true');
  const data = await response.json();
  return data.tools || [];
}

export default function NavDropdown() {
  const pathname = usePathname();
  const [tools, setTools] = useState<Tool[]>([]);
  
  useEffect(() => {
    // Fetch tools
    fetchTools().then(setTools);
    
    // Add Google Material Icons
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="text-muted hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1">
        AI Tools
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-border focus:outline-none">
          <div className="py-1">
            {[...tools, {
              id: 'saved-items',
              name: 'Saved Items',
              href: '/saved-items',
              icon: 'folder',
              description: 'View your saved items',
              is_active: true,
              sort_order: 999
            }].map((tool) => (
              <Menu.Item key={tool.href}>
                {({ active }: { active: boolean }) => (
                  <Link
                    href={tool.href}
                    className={`${
                      active || pathname === tool.href
                        ? "bg-muted/20 text-foreground"
                        : "text-muted-foreground"
                    } group flex items-center px-4 py-2 text-sm gap-3`}
                  >
                    <span 
                      className="material-icons text-xl text-muted"
                      aria-hidden="true"
                    >
                      {tool.icon}
                    </span>
                    {tool.name}
                  </Link>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
