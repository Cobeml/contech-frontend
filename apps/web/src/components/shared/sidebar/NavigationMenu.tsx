'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@repo/ui/components/ui/sidebar';
import { FolderIcon, PlusIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { ClerkUser } from './_footer/ClerkUser';
import { Heading } from './_header/Heading';
import { useProjectNavigation } from './useProjectNavigation';

export function NavigationMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { projects } = useProjectNavigation();
  const { setOpen } = useSidebar();

  // Restore hover behavior
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 500);
  }, [setOpen]);

  const handleMouseEnter = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    setOpen(true);
  }, [setOpen]);

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader>
        <Heading />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <SidebarMenuButton
              onClick={() => router.push('/projects')}
              isActive={pathname === '/projects'}
              tooltip="All Projects"
            >
              Projects
            </SidebarMenuButton>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.projectId}>
                  <SidebarMenuButton
                    onClick={() =>
                      router.push(`/projects/${project.projectId}`)
                    }
                    isActive={pathname === `/projects/${project.projectId}`}
                    tooltip={project.name}
                  >
                    <FolderIcon />
                    <span>{project.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => router.push('/projects/new')}
                  tooltip="New Project"
                >
                  <PlusIcon />
                  <span>New Project</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ClerkUser />
      </SidebarFooter>
    </Sidebar>
  );
}
