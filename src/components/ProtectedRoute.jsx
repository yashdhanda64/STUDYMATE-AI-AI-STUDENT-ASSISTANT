import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading, isDemoMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading StudyMate AI...</p>
      </div>
    );
  }

  // Allow access if logged in or operating in offline demo mode
  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
