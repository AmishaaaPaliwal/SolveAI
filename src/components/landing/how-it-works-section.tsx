import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Stethoscope, Building, PenSquare, Share2, ClipboardPlus, Bot, Send } from "lucide-react";

const patientSteps = [
  { icon: <PenSquare />, text: "Register and create your profile." },
  { icon: <Share2 />, text: "Share your unique code with the hospital." },
  { icon: <Send />, text: "Receive your personalized diet chart." },
  { icon: <Bot />, text: "Chat with your personal bot for guidance." },
];

const dietitianSteps = [
  { icon: <ClipboardPlus />, text: "Enter patient code to fetch profile." },
  { icon: <Bot />, text: "Use AI to generate a baseline diet chart." },
  { icon: <PenSquare />, text: "Review, customize, and approve the chart." },
  { icon: <Send />, text: "Deliver the plan and monitor patient progress." },
];

const hospitalSteps = [
  { icon: <User />, text: "Link patient profiles using their unique code." },
  { icon: <ClipboardPlus />, text: "Update daily mess menus and patient vitals." },
  { icon: <Stethoscope />, text: "Provide dietitians with up-to-date information." },
];

const Step = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center gap-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
      {icon}
    </div>
    <p className="text-foreground/90">{text}</p>
  </div>
);

const RoleCard = ({ title, icon, steps }: { title: string, icon: React.ReactNode, steps: { icon: React.ReactNode, text: string }[] }) => (
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-headline text-2xl">
        {icon} For {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      {steps.map((step, index) => <Step key={index} icon={step.icon} text={step.text} />)}
    </CardContent>
  </Card>
);

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-5xl">A Simple Path to Wellness</h2>
            <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              AyurTrack simplifies health management for everyone involved. Here's how each role benefits from our streamlined process.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:gap-12 lg:max-w-none lg:grid-cols-3">
          <RoleCard title="Patients" icon={<User />} steps={patientSteps} />
          <RoleCard title="Dietitians" icon={<Stethoscope />} steps={dietitianSteps} />
          <RoleCard title="Hospitals" icon={<Building />} steps={hospitalSteps} />
        </div>
      </div>
    </section>
  );
}
