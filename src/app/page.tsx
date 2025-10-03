import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 tablet:px-6 desktop:px-8">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 text-primary">🌿</div>
            <span className="font-bold font-headline text-sm tablet:text-base">
              SolveAI
            </span>
          </div>
        </div>
      </div>
      <main className="flex-1">
        <section className="w-full py-8 xs:py-12 tablet:py-16 desktop:py-24 desktop-lg:py-32">
          <div className="container px-4 xs:px-6 tablet:px-8">
            <div className="flex flex-col items-center justify-center space-y-3 tablet:space-y-4 text-center">
              <h1 className="text-2xl font-bold tracking-tighter font-headline xs:text-3xl tablet:text-4xl desktop:text-5xl">
                SolveAI - Ayurvedic Diet Management
              </h1>
              <p className="max-w-[600px] text-sm xs:text-base tablet:text-lg desktop:text-xl text-foreground/80">
                AI-powered diet chart generation and health tracking based on Ayurvedic principles.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-3 xs:gap-4 py-6 xs:py-8 tablet:py-10 px-4 xs:px-6 tablet:px-8">
          <p className="text-center text-xs xs:text-sm leading-relaxed">
            Built for a healthier tomorrow. &copy; {new Date().getFullYear()} SolveAI. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
