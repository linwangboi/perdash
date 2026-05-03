"use client";
import { navItems } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";
import { signOut } from "@/lib/auth";

const Sidebar = ({ firstName, email }) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };
  return (
    <aside className="sidebar">
      <Link href="/">
        <Image
          src="/assets/logo-full-red.svg"
          alt="logo"
          width={160}
          height={50}
          className="hidden h-auto ml-10 lg:block"
        />
        <Image
          src="/assets/logo-full-red.svg"
          alt="logo"
          width={52}
          height={55}
          className="lg:hidden"
        />
      </Link>
      <nav className="sidebar-nav">
        <ul className="flex flex-col gap-6 flex-1">
          {navItems.map(({ url, name, icon }) => (
            <Link key={name} href={url} className="lg:w-full">
              <li
                className={cn(
                  "sidebar-nav-item",
                  pathname === url && "shad-active",
                )}
              >
                <Image
                  src={icon}
                  alt={name}
                  width={24}
                  height={24}
                  className={cn(
                    "nav-icon",
                    pathname === url && "nav-icon-active",
                  )}
                />
                <p className="hidden lg:block">{name}</p>
              </li>
            </Link>
          ))}
        </ul>
      </nav>
      <Image
        src="/assets/files.png"
        alt="logo"
        width={506}
        height={418}
        className="w-full p-2"
      />
      <div className="sidebar-user-info">
        <Image
          src="/assets/avatar.png"
          alt="avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />
        <div className="hidden lg:block line-clamp-1">
          <p className="subtitle-2 capitalize">{firstName}</p>
          <p className="caption">{email}</p>
        </div>
        <Button
          type="button"
          onClick={handleSignOut}
          className="sign-out-button"
        >
          <Image
            src="/assets/logout.svg"
            alt="Sign out"
            width={24}
            height={24}
            className="w-6"
          />
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
