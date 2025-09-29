'use client';

import { useSearchParams } from 'next/navigation';
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
  { name: 'Dashboard', icon: <LayoutDashboard /> },
  { name: 'My Diet Plan', icon: <FileText /> },
  { name: 'Personal Chatbot', icon: <Bot /> },
  { name: 'My Profile', icon: <User /> },
];

const dietitianNav = [
  { name: 'Dashboard', icon: <LayoutDashboard /> },
  { name: 'Patients', icon: <User /> },
  { name: 'Generate Plan', icon: <Bot /> },
  { name: 'Consultations', icon: <Stethoscope /> },
];

const hospitalNav = [
  { name: 'Dashboard', icon: <LayoutDashboard /> },
  { name: 'Link Patient', icon: <User /> },
  { name: 'Update Vitals', icon: <HeartPulse /> },
  { name: 'Mess Menu', icon: <UtensilsCrossed /> },
];

const navItems: Record<Role, { name: string; icon: React.ReactNode }[]> = {
  patient: patientNav,
  dietitian: dietitianNav,
  hospital: hospitalNav,
};

export function DashboardSidebar() {
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as Role) || 'patient';
  const currentNav = navItems[role];

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarMenu>
          {currentNav.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                tooltip={{ children: item.name }}
                isActive={item.name === 'Dashboard'}
              >
                {item.icon}
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
