"use client";

import React from "react";
import { Card } from "@/components";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`p-8 text-center ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="text-4xl">{icon}</div>
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </Card>
  );
}
