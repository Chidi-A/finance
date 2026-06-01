import { Logo } from '@/components/Common/Logo';
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

import { User } from './User';
import useAuth from '@/hooks/useAuth';

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
  const { user } = useAuth();

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
