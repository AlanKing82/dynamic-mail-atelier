import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Mail,
  Wand2,
  Building2,
  Users,
  Crown,
  Building,
  Inbox,
  Radar,
  Map,
  Bell,
  BookOpen,
  BarChart3,
  MapPin,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const primaryItems = [
  { title: "Home", url: "/", icon: Home, enabled: true },
  { title: "Email Templates", url: "/email-templates", icon: Mail, enabled: true },
  { title: "Email Builder", url: "/email-builder", icon: Wand2, enabled: true },
];

const placeholderItems = [
  { title: "Tenants", icon: Building2 },
  { title: "Admins", icon: Crown },
  { title: "Companies", icon: Building },
  { title: "Contact Us Inbox", icon: Inbox },
  { title: "Trigger Zones", icon: Radar },
  { title: "Trigger Zone Map", icon: Map },
  { title: "Trigger Systems", icon: Bell },
  { title: "Quotes", icon: BookOpen },
  { title: "Reports", icon: BarChart3 },
  { title: "Users", icon: Users },
  { title: "Policy Map", icon: MapPin },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-sidebar-foreground tracking-tight">
            exante
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {placeholderItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="opacity-60 cursor-not-allowed"
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="opacity-60 cursor-not-allowed">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
