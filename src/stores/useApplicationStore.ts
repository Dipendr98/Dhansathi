import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ApplicationStatus = 'Interested' | 'Documents Pending' | 'Applied' | 'Under Review' | 'Approved' | 'Rejected' | 'Payment Received';

export interface TrackedApplication {
  id: string; // scheme or scholarship ID
  title: string;
  type: 'scheme' | 'scholarship';
  status: ApplicationStatus;
  applied_date?: string;
  deadline?: string;
  portal_url?: string;
  notes?: string;
  updated_at: string;
}

interface ApplicationState {
  applications: Record<string, TrackedApplication>;
  trackApplication: (app: Omit<TrackedApplication, 'updated_at'>) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  removeApplication: (id: string) => void;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      applications: {},
      trackApplication: (app) =>
        set((state) => ({
          applications: {
            ...state.applications,
            [app.id]: { ...app, updated_at: new Date().toISOString() },
          },
        })),
      updateStatus: (id, status) =>
        set((state) => {
          const existing = state.applications[id];
          if (!existing) return state;
          return {
            applications: {
              ...state.applications,
              [id]: { ...existing, status, updated_at: new Date().toISOString() },
            },
          };
        }),
      removeApplication: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.applications;
          return { applications: rest };
        }),
    }),
    {
      name: 'dhansathi-application-tracker',
    }
  )
);
