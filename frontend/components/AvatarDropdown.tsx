"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Heart } from "lucide-react";
import Link from "next/link";

export default function AvatarDropdown({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const first_name = user.name.split(" ")[0];
  const last_name = user.name.split(" ")[1];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-12 rounded-full">
          <React.Fragment>
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.image} alt="Profile" />
              <AvatarFallback className="text-xl font-semibold">
                {first_name[0]}
                {last_name?.[0]}
              </AvatarFallback>
            </Avatar>
          </React.Fragment>
        </Button>
      </DropdownMenuTrigger>
      <AnimatePresence>
        {isOpen && (
          <DropdownMenuContent
            className="w-56 p-3"
            align="end"
            asChild
            forceMount
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {first_name} {last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={"/user/[username]"} as={`/user/${user.username}`}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={"/contributions"}>
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Your Contributions</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900"
              >
                <Link href="/signout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </Link>
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
}
