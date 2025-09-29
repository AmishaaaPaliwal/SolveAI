"use client";

import * as React from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";

export function Header() {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block">
              AyurTrack
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/register">Register as Patient</Link>
              </Button>
              <Button onClick={() => setIsLoginOpen(true)}>Login / Get Started</Button>
            </nav>
          </div>
        </div>
      </header>
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}
