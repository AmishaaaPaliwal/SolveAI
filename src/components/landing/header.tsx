"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";

export function Header() {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">SolveAI</span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Mobile menu placeholder */}
          </div>
          <nav className="flex items-center">
            <Button variant="ghost" onClick={() => setIsLoginOpen(true)}>Login</Button>
          </nav>
        </div>
      </div>
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </header>
  );
}