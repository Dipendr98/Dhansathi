import { useApplicationStore, type ApplicationStatus } from '@/stores/useApplicationStore';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  'Interested': 'bg-surface-container text-on-surface-variant border-outline-variant/30',
  'Documents Pending': 'bg-error-container text-on-error-container border-error/30',
  'Applied': 'bg-primary-container text-on-primary-container border-primary/30',
  'Under Review': 'bg-tertiary-container text-on-tertiary-container border-tertiary/30',
  'Approved': 'bg-secondary-container text-on-secondary-container border-secondary/30',
  'Rejected': 'bg-error text-on-error border-error',
  'Payment Received': 'bg-[#146c2e]/10 text-[#146c2e] border-[#146c2e]/30',
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Interested', 'Documents Pending', 'Applied', 'Under Review', 'Approved', 'Rejected', 'Payment Received'
];

export default function ApplicationTracker() {
  const applicationMap = useApplicationStore((s) => s.applications);
  const updateStatus = useApplicationStore((s) => s.updateStatus);
  const removeApplication = useApplicationStore((s) => s.removeApplication);

  const applications = useMemo(() => {
    return Object.values(applicationMap || {})
      .filter(Boolean)
      .sort((a, b) => {
        const timeA = a?.updated_at ? new Date(a.updated_at).getTime() : 0;
        const timeB = b?.updated_at ? new Date(b.updated_at).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });
  }, [applicationMap]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-extrabold text-on-surface">Application Tracker</h1>
          <p className="text-sm text-on-surface-variant mt-1">Track your schemes and scholarships all in one place.</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">folder_open</span>
          <h3 className="text-lg font-bold text-on-surface mb-2">No tracked applications yet</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
            When you find a scheme or scholarship you are interested in, click "Track Application" to save it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {app.type}
                    </span>
                    {app.deadline && (
                      <span className="text-xs text-on-surface-variant flex items-center">
                        <span className="material-symbols-outlined text-[14px] mr-1">timer</span>
                        {(() => {
                          const d = new Date(app.deadline);
                          if (isNaN(d.getTime())) return `Due: ${app.deadline}`;
                          return `Due: ${d.toLocaleDateString()}`;
                        })()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-on-surface leading-tight">{app.title}</h3>
                  {app.portal_url && (
                    <a href={app.portal_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-flex items-center">
                      Official Portal <span className="material-symbols-outlined text-[12px] ml-1">open_in_new</span>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border appearance-none outline-none cursor-pointer ${STATUS_COLORS[app.status]}`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-surface text-on-surface">{opt}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeApplication(app.id)}
                    className="h-8 w-8 rounded-full bg-surface-container hover:bg-error/10 hover:text-error text-outline flex items-center justify-center transition-colors"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
