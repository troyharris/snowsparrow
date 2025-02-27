"use client";

import NavDropdown from "./NavDropdown";
import AdminDropdown from "./AdminDropdown";

export default function ClientNav() {
  return (
    <div className="flex items-center gap-4">
      <NavDropdown />
      <AdminDropdown />
    </div>
  );
}
