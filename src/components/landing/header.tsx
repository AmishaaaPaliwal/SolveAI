"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";
import { Leaf } from "lucide-react";

export function Header() {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 xs:px-6 tablet:px-8">
        <div className="mr-4 hidden tablet:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 font-headline font-semibold">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="hidden font-bold tablet:inline-block">SolveAI</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="#features"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              How it Works
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 tablet:justify-end">
          <div className="w-full flex-1 tablet:w-auto tablet:flex-none">
            <Link href="/" className="flex items-center space-x-2 font-headline font-semibold tablet:hidden">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="font-bold">SolveAI</span>
            </Link>
          </div>
          <nav className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setIsLoginOpen(true)}>
              Login
            </Button>
          </nav>
        </div>
      </div>
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </header>
  );
}