import { Link as RouterLink, useRouterState } from '@tanstack/react-router';
import React from 'react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export type Item = {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  path: string;
};

interface MainProps {
  items: Item[];
}

export function Main({ items }: MainProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = currentPath === item.path;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  asChild
                >
                  <RouterLink to={item.path} onClick={handleMenuClick}>
                    <item.icon className="size-4 shrink-0 text-[#B3B3B3] in-data-[active=true]:text-[#277C78]" />
                    <span>{item.title}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
