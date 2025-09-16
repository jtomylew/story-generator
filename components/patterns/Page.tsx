"use client";

import React from "react";

interface PageProps {
  children: React.ReactNode;
  className?: string;
}

export function Page({ children, className = "" }: PageProps) {
  return (
    <div
      className={`mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-10 ${className}`}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}
