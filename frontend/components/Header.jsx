"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Search from "./Search";
import { Button } from "./ui/button";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const Header = ({ email }) => {
  const router = useRouter();
  const handleClick = () => {
    router.push("/user-profile");
  };

  return (
    <TooltipProvider>
      <header className="header flex items-center">
        <Search />
        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                onClick={handleClick}
                className="cursor-pointer mt-5"
              >
                <Image
                  src="/assets/avatar.png"
                  alt="avatar"
                  width={44}
                  height={44}
                  className="sidebar-user-avatar transition-transform duration-300 ease-in-out transform hover:scale-125"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent className='bg-black text-white'>
              <p>Manage your profile</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
