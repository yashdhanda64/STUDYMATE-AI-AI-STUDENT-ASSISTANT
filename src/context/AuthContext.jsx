import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, profileService, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const currentUser = await authService.getUser();
        if (currentUser && mounted) {
          setUser(currentUser);
          const userProfile = await profileService.getProfile(currentUser.id);
          if (mounted) setProfile(userProfile);
        }
      } catch (err) {
        console.warn('Auth init note:', err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        try {
          const p = await profileService.getProfile(session.user.id);
          if (mounted) setProfile(p);
        } catch (e) {
          console.warn('Failed to load profile:', e);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.signIn(email, password);
      setUser(data.user);
      const userProfile = await profileService.getProfile(data.user.id);
      setProfile(userProfile);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName) => {
    setLoading(true);
    try {
      const data = await authService.signUp(email, password, fullName);
      if (data.user) {
        setUser(data.user);
        const userProfile = await profileService.getProfile(data.user.id);
        setProfile(userProfile);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return null;
    const updated = await profileService.updateProfile(user.id, updates);
    setProfile(updated);
    return updated;
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    const demoUser = {
      id: 'demo-student-uuid',
      email: 'alex.chen@university.edu',
      user_metadata: { full_name: 'Alex Chen' }
    };
    setUser(demoUser);
    profileService.getProfile('demo-student-uuid').then(p => setProfile(p));
  };

  const value = {
    user,
    profile,
    loading,
    isDemoMode,
    isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    updateProfile,
    enterDemoMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
