import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Loader from '@/components/shared/Loader';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized) {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        // If initialized but no user, the token might be invalid or missing
        navigate('/login', { replace: true });
      }
    }
  }, [user, initialized, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader />
        <p className="text-on-surface-variant font-medium animate-pulse">
          Authenticating with Google...
        </p>
      </div>
    </div>
  );
}
