"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Challenges",
    href: "/challenges",
  },
  {
    name: "Blog",
    href: "/blog",
  },
  {
    name: "About",
    href: "/about",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList className={cn("space-x-4 ")}>
        {navLinks.map((link, idx) => {
          return (
            <NavigationMenuItem key={idx}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors cursor-pointer no-underline",
                  pathname === link.href
                    ? "text-primary"
                    : "text-primary/60 hover:text-primary/90"
                )}
              >
                {link.name}
              </Link>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
