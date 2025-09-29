
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  HeartPulse,
  Bot,
  User,
  Stethoscope,
  Building,
  UtensilsCrossed,
  FileText,
} from 'lucide-react';
import type { Role } from '@/lib/types';

const patientNav = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard /> },
  { name: 'Personal Chatbot', href: '/dashboard/chatbot', icon: <Bot /> },
  { name: 'My Profile', href: '/dashboard/profile', icon: <User /> },
];

const dietitianNav = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard /> },
  { name: 'Patients', href: '/dashboard/patients', icon: <User /> },
  { name: 'Generate Plan', href: '/dashboard/generate-plan', icon: <Bot /> },
  { name: 'Consultations', href: '/dashboard/consultations', icon: <Stethoscope /> },
];

const hospitalNav = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard /> },
  { name: 'Link Patient', href: '/dashboard/link-patient', icon: <User /> },
  { name: 'Update Vitals', href: '/dashboard/update-vitals', icon: <HeartPulse /> },
  { name: 'Mess Menu', href: '/dashboard/mess-menu', icon: <UtensilsCrossed /> },
];

const navItems: Record<Role, { name: string; href: string; icon: React.ReactNode }[]> = {
  patient: patientNav,
  dietitian: dietitianNav,
  hospital: hospitalNav,
};

export function DashboardSidebar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const role = (searchParams.get('role') as Role) || 'patient';
  const currentNav = navItems[role];

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarMenu>
          {currentNav.map((item) => (
            <SidebarMenuItem key={item.name}>
                <Link href={`${item.href}?role=${role}`} className="w-full">
                    <SidebarMenuButton
                        tooltip={{ children: item.name }}
                        isActive={pathname === item.href}
                        className="w-full"
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
