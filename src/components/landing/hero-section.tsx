"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function HeroSection() {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

  return (
    <>
      <section className="relative w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter font-headline sm:text-5xl xl:text-6xl/none text-balance">
                  Harmonize Your Health with AI-Powered Ayurvedic Nutrition
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl text-balance">
                  AyurTrack combines ancient wisdom with modern technology to create personalized diet plans that align with your unique constitution and health goals.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" onClick={() => setIsLoginOpen(true)}>
                  Get Started
                </Button>
              </div>
            </div>
            {heroImage && (
              <Image
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                data-ai-hint={heroImage.imageHint}
                height="550"
                src={heroImage.imageUrl}
                width="550"
              />
            )}
          </div>
        </div>
      </section>
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}
