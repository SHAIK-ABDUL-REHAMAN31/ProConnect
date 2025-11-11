import NavrBarComponent from "@/components/Navbar";
import React, { Children } from "react";

export default function UserLayout({ children }) {
  return (
    <div>
      <NavrBarComponent />
      {children}
    </div>
  );
}
