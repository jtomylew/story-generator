"use client";

import React from "react";
import { Badge } from "@/components/ui";

interface CategoryFilterProps {
  categories: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  science: "Science",
  nature: "Nature",
  sports: "Sports",
  arts: "Arts",
  education: "Education",
  technology: "Technology",
  animals: "Animals",
};

export function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  const handleCategoryToggle = (category: string) => {
    if (category === "all") {
      // Toggle between all selected (empty array) and none
      onChange(selected.length === 0 ? categories : []);
    } else {
      const isSelected = selected.includes(category);
      let nextSelected: string[];

      if (isSelected) {
        // Remove category
        nextSelected = selected.filter((c) => c !== category);
      } else {
        // Add category
        nextSelected = [...selected, category];
      }

      // If all categories are selected, normalize to empty array (show all)
      if (nextSelected.length === categories.length) {
        nextSelected = [];
      }

      onChange(nextSelected);
    }
  };

  const isAllSelected = selected.length === 0;
  const isCategorySelected = (category: string) => selected.includes(category);

  return (
    <div className="flex flex-wrap gap-2">
      {/* All categories chip */}
      <Badge
        variant={isAllSelected ? "brand" : "neutral"}
        className="cursor-pointer transition-colors hover:bg-primary/80"
        onClick={() => handleCategoryToggle("all")}
        role="button"
        tabIndex={0}
        aria-pressed={isAllSelected}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCategoryToggle("all");
          }
        }}
      >
        All
      </Badge>

      {/* Individual category chips */}
      {categories.map((category) => {
        const isSelected = isCategorySelected(category);
        const label = CATEGORY_LABELS[category] || category;

        return (
          <Badge
            key={category}
            variant={isSelected ? "brand" : "neutral"}
            className="cursor-pointer transition-colors hover:bg-primary/80"
            onClick={() => handleCategoryToggle(category)}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCategoryToggle(category);
              }
            }}
          >
            {label}
          </Badge>
        );
      })}
    </div>
  );
}
