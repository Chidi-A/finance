import { Logo } from '@/components/Common/Logo';
import { useIsMobile } from '@/hooks/useMobile';
import { Link as RouterLink, useRouterState } from '@tanstack/react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import {
  OverviewIcon,
  TransactionsIcon,
  BudgetsIcon,
  PotsIcon,
  RecurringBillsIcon,
  MinimizeMenuIcon,
} from '@/components/Icons/NavIcons';

import { type Item, Main } from './Main';

const navItems: Item[] = [
  { icon: OverviewIcon, title: 'Overview', path: '/' },
  { icon: TransactionsIcon, title: 'Transactions', path: '/transactions' },
  { icon: BudgetsIcon, title: 'Budgets', path: '/budgets' },
  { icon: PotsIcon, title: 'Pots', path: '/pots' },
  {
    icon: RecurringBillsIcon,
    title: 'Recurring Bills',
    path: '/recurring-bills',
  },
];

function MinimizeMenu() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Expand Menu" onClick={toggleSidebar}>
          <MinimizeMenuIcon
            className={`size-4 shrink-0 transition-transform duration-200 ${open ? '' : 'rotate-180'}`}
          />
          <span>Minimize Menu</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const isMobile = useIsMobile();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:h-16 h-14 items-end bg-[#201F24] rounded-tl-lg rounded-tr-lg">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <RouterLink
              key={item.title}
              to={item.path}
              className={`flex flex-1 flex-col items-center gap-1 pb-3 pt-2 text-xs transition-colors ${
                isActive
                  ? 'text-[#277C78] bg-[#F8F4F0] rounded-tl-lg rounded-tr-lg'
                  : 'text-[#B3B3B3]'
              }`}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="hidden sm:inline">{item.title}</span>
            </RouterLink>
          );
        })}
      </nav>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pt-6 pb-13 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center ">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <Main items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        {/* <User user={user} /> */}
        <MinimizeMenu />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
