import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tools = [
  {
    name: "Business Continuity Plan",
    href: "/bcp",
    icon: "description",
  },
  {
    name: "Flowchart Creator",
    href: "/mermaid",
    icon: "account_tree",
  },
  {
    name: "Employee Handbook",
    href: "/handbook",
    icon: "menu_book",
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: "chat",
  },
  {
    name: "Saved Items",
    href: "/saved-items",
    icon: "folder",
  },
];

export default function NavDropdown() {
  const pathname = usePathname();
  
  // Add Google Material Icons
  useEffect(() => {
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
      <Menu.Button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1">
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {tools.map((tool) => (
              <Menu.Item key={tool.href}>
                {({ active }: { active: boolean }) => (
                  <Link
                    href={tool.href}
                    className={`${
                      active || pathname === tool.href
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700"
                    } group flex items-center px-4 py-2 text-sm gap-3`}
                  >
                    <span 
                      className="material-icons text-xl text-gray-500"
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
