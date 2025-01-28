import { create } from 'zustand';
import type { ProjectOverview } from '../types/ProjectOverview';

interface ProjectOverviewState {
  projects: ProjectOverview[];

  // Loading State
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  // Error State
  error: string | null;
  setError: (error: string | null) => void;

  // CRUD Operations
  createProject: (project?: Partial<ProjectOverview>) => void;
  updateProject: (
    projectId: string,
    updates: Partial<Omit<ProjectOverview, 'projectId' | 'userId'>>,
  ) => Promise<void>;

  // API Operations
  saveProject: () => Promise<void>;

  // New state
  setProjects: (projects: ProjectOverview[]) => void;
}

export const useProjectOverviewStore = create<ProjectOverviewState>()(
  (set, get) => ({
    projects: [],
    isLoading: false,
    error: null,

    setIsLoading: (isLoading: boolean) => {
      set({ isLoading });
    },
    setError: (error: string | null) => {
      set({ error });
    },
    setProjects: (projects: ProjectOverview[]) => {
      set({ projects });
    },
    createProject: (project?: Partial<ProjectOverview>) => {
      const newProject: ProjectOverview = {
        projectId: crypto.randomUUID(),
        userId: project?.userId || '',
        name:
          project?.name || `New TakeOff Project ${get().projects.length + 1}`,
        imageUrl:
          project?.imageUrl ||
          '/api/placeholder?width=300&height=200&dark=true',
        description:
          project?.description ||
          'Double-click to open. Click to edit description.',
      };
      set((state) => ({
        projects: [...state.projects, newProject],
      }));
    },
    updateProject: async (
      projectId: string,
      updates: Partial<Omit<ProjectOverview, 'projectId' | 'userId'>>,
    ) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.projectId === projectId
            ? { ...project, ...updates }
            : project,
        ),
      }));
      return Promise.resolve();
    },

    saveProject: async () => {
      const projects = get().projects;

      if (projects.length === 0) {
        return;
      }

      const response = await fetch('/api/saveOverview', {
        method: 'POST',
        body: JSON.stringify({ projects }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(`Failed to save workflows: ${errorResponse.error}`);
      }
      return response.json();
    },
  }),
);
