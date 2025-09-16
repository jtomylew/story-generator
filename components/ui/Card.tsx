"use client";

import React from "react";
import * as SubframeUtils from "./utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(function CardRoot(
  { children, className, ...otherProps }: CardProps,
  ref,
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      {children}
    </div>
  );
});

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(
    { children, className, ...otherProps }: CardHeaderProps,
    ref,
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex flex-col space-y-1.5 p-6",
          className,
        )}
        ref={ref}
        {...otherProps}
      >
        {children}
      </div>
    );
  },
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle(
    { children, className, ...otherProps }: CardTitleProps,
    ref,
  ) {
    return (
      <h3
        className={SubframeUtils.twClassNames(
          "text-2xl font-semibold leading-none tracking-tight",
          className,
        )}
        ref={ref}
        {...otherProps}
      >
        {children}
      </h3>
    );
  },
);

interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
  className?: string;
}

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(function CardDescription(
  { children, className, ...otherProps }: CardDescriptionProps,
  ref,
) {
  return (
    <p
      className={SubframeUtils.twClassNames(
        "text-sm text-muted-foreground",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      {children}
    </p>
  );
});

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent(
    { children, className, ...otherProps }: CardContentProps,
    ref,
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames("p-6 pt-0", className)}
        ref={ref}
        {...otherProps}
      >
        {children}
      </div>
    );
  },
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter(
    { children, className, ...otherProps }: CardFooterProps,
    ref,
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex items-center p-6 pt-0",
          className,
        )}
        ref={ref}
        {...otherProps}
      >
        {children}
      </div>
    );
  },
);

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});
