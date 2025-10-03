"use client";

import * as React from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";

export function Header() {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  return (
    <div>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 tablet:px-6 desktop:px-8">
          <Link href="/" className="mr-4 tablet:mr-6 flex items-center space-x-2">
            <Leaf className="h-5 w-5 tablet:h-6 tablet:w-6 text-primary" />
            <span className="font-bold font-headline text-sm tablet:text-base xs:hidden tablet:inline-block">
              SolveAI
            </span>
            <span className="font-bold font-headline text-sm tablet:hidden">
              SA
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2 tablet:space-x-4">
            <nav className="flex items-center space-x-1 tablet:space-x-2">
              <Button variant="outline" size="sm" className="text-xs tablet:text-sm px-2 tablet:px-4" asChild>
                <Link href="/register" className="hidden tablet:inline">Register as Patient</Link>
                <Link href="/register" className="tablet:hidden">Register</Link>
              </Button>
              <Button size="sm" className="text-xs tablet:text-sm px-2 tablet:px-4" onClick={() => setIsLoginOpen(true)}>
                <span className="hidden tablet:inline">Login / Get Started</span>
                <span className="tablet:hidden">Login</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </div>
  );
}
