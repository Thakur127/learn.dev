"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import React from "react";

export default function BreadcrumPath() {
  const pathname = usePathname();

  if (!pathname) return null;

  const pathNameArray = pathname.split("/");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathNameArray.map((path: string, index: number) => {
          if (index === pathNameArray.length - 1) {
            return (
              <BreadcrumbItem key={index}>
                <BreadcrumbPage>{path}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${path}`}>{path === "" ? "home" : path}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight size={16} />
              </BreadcrumbSeparator>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
