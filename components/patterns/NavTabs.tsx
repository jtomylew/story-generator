"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs } from "@/components/ui";

interface TabItem {
  label: string;
  href: string;
}

interface NavTabsProps {
  tabs: TabItem[];
  className?: string;
}

export function NavTabs({ tabs, className }: NavTabsProps) {
  const pathname = usePathname();

  return (
    <Tabs className={className}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href}>
            <Tabs.Item active={isActive}>
              {tab.label}
            </Tabs.Item>
          </Link>
        );
      })}
    </Tabs>
  );
}

