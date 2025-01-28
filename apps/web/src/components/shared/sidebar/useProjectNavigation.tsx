'use client';

import { useProjectOverviewStore } from '@/stores/ProjectOverview';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export function useProjectNavigation() {
  const { user } = useUser();
  const { projects, setProjects, setError, setIsLoading } =
    useProjectOverviewStore();

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

  return { projects };
}
