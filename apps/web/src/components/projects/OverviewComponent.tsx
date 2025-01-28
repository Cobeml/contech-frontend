'use client';
import { SitePlanLoadErrorToast } from '@/components/shared/toasts/Toasts';
import { useProjectOverviewStore } from '@/stores/ProjectOverview';
import { useUser } from '@clerk/nextjs';
import { Button } from '@repo/ui';
import { Card } from '@repo/ui/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui/components/ui/tooltip';
import { Skeleton } from '@ui/components/ui/skeleton';
import { PlusIcon } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import WorkflowCard from './OverviewCard';

/**
 * WorkflowSkeleton component renders a skeleton UI for loading states.
 * It displays three placeholder skeletons to indicate loading content.
 *
 * @returns {React.JSX.Element} The rendered skeleton UI.
 */
function WorkflowSkeleton(): React.JSX.Element {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-full max-w-sm">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="space-y-2 mt-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function WorkflowOverview() {
  const {
    projects,
    isLoading,
    error,
    setIsLoading,
    setError,
    setProjects,
    createProject,
    saveProject,
  } = useProjectOverviewStore();
  const { user } = useUser();

  useEffect(() => {
    async function fetchProjects() {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/getProjects?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load projects',
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [user?.id, setIsLoading, setError, setProjects]);

  const handleProjectCreation = () => {
    if (!user?.id) {
      return;
    }
    createProject({
      projectId: crypto.randomUUID(),
      userId: user.id,
      imageUrl: '/map/nyc-default-map.webp',
      name: 'New Project',
      description: 'Project description',
    });
  };

  return (
    <div className="container mx-auto px-8 py-8">
      {error && <SitePlanLoadErrorToast error={error} />}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Site Plan Directory</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleProjectCreation}
                size="icon"
                variant="outline"
              >
                <PlusIcon className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>New Study</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card className="p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
          {isLoading ? (
            <WorkflowSkeleton />
          ) : (
            <>
              {projects.map((project) => (
                <WorkflowCard key={project.projectId} project={project} />
              ))}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
