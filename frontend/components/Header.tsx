"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import MaxWidthWrapper from "./MaxWidthWrapper";
import AvatarDropdown from "./AvatarDropdown";
import { ArrowRightIcon, CodeXml, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/challenges", label: "Challenges" },
  ];

  const unauthenticatedMenuItems = [
    { href: "#features", label: "Features" },
    { href: "#contribute", label: "Contributors" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MaxWidthWrapper className="py-3">
        <div className="flex items-center justify-between md:min-h-14">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center space-x-2 no-underline">
              <CodeXml className="h-6 w-6" />
              <span className="text-lg font-bold">learn.dev</span>
            </Link>

            <nav className="gap-2 md:gap-4 hidden md:flex">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                    pathname === item.href && "text-primary"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          {/* Desktop Navigation */}
          {status !== "loading" && (
            <nav className="hidden md:flex items-center space-x-6">
              {status === "authenticated" ? (
                <AvatarDropdown user={session.user} />
              ) : (
                <>
                  {unauthenticatedMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                        pathname === item.href && "text-primary"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <nav className="space-x-4">
                    <Button asChild variant="ghost">
                      <Link href="/signin">Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">
                        Get Started
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </nav>
                </>
              )}
            </nav>
          )}

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
          >
            <nav className="flex flex-col items-center space-y-4 py-4 bg-background">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                    pathname === item.href && "text-primary"
                  )}
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              ))}
              {status !== "loading" &&
                (status === "authenticated" ? (
                  <AvatarDropdown user={session.user} />
                ) : (
                  <>
                    {unauthenticatedMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                          pathname === item.href && "text-primary"
                        )}
                        onClick={toggleMenu}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/signin">Sign In</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/signup">
                        Get Started
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
