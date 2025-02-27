import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const adminPages = [
  {
    name: "Admin Dashboard",
    href: "/admin",
    icon: "dashboard",
  },
];

export default function AdminDropdown() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Use the API endpoint instead of querying profiles directly
        const response = await fetch(
          `/api/users/check-admin?userId=${user.id}`
        );

        if (!response.ok) {
          console.error("Error checking admin status:", await response.text());
          setIsAdmin(false);
        } else {
          const data = await response.json();
          setIsAdmin(data.isAdmin || false);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, []);

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1">
        Admin
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
            {adminPages.map((page) => (
              <Menu.Item key={page.href}>
                {({ active }: { active: boolean }) => (
                  <Link
                    href={page.href}
                    className={`${
                      active || pathname === page.href
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700"
                    } group flex items-center px-4 py-2 text-sm gap-3`}
                  >
                    <span 
                      className="material-icons text-xl text-gray-500"
                      aria-hidden="true"
                    >
                      {page.icon}
                    </span>
                    {page.name}
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
