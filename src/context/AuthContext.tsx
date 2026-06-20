"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile } from '@/types';
import { useRouter } from 'next/navigation';
import { STUDENTS_LIST_SEED, TEACHER_SEED, PARENT_SEED } from '@/store/seeds';

interface AuthContextType {
  session: any | null;
  user: UserProfile | null;
  loading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getDemoUser = (email: string) => {
  if (email === TEACHER_SEED.email) return TEACHER_SEED;
  if (email === PARENT_SEED.email) return PARENT_SEED;
  return STUDENTS_LIST_SEED.find(s => s.email === email);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check session on load
    const checkSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ? {
        id: initialSession.user.id,
        first_name: initialSession.user.user_metadata?.first_name || 'Usuario',
        last_name: initialSession.user.user_metadata?.last_name || '',
        role: (initialSession.user.user_metadata?.role || 'student') as any,
        email: initialSession.user.email || '',
        created_at: initialSession.user.created_at,
        updated_at: new Date().toISOString()
      } : null);
      setLoading(false);
    };

    checkSession();

    // Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ? {
        id: currentSession.user.id,
        first_name: currentSession.user.user_metadata?.first_name || 'Usuario',
        last_name: currentSession.user.user_metadata?.last_name || '',
        role: (currentSession.user.user_metadata?.role || 'student') as any,
        email: currentSession.user.email || '',
        created_at: currentSession.user.created_at,
        updated_at: new Date().toISOString()
      } : null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const password = 'ISkoolPassword2026!';
    
    // 1. Try to sign in
    const signInResult = await supabase.auth.signInWithPassword({ email, password });
    
    let userObj: any = null;
    let sessionObj: any = null;

    if (signInResult.error) {
      if (signInResult.error.message.includes('Invalid login credentials') || 
          signInResult.error.message.includes('User not found') || 
          signInResult.error.message.includes('Email not confirmed')) {
        // Auto-create user
        const demoUser = getDemoUser(email);
        const first_name = demoUser ? demoUser.first_name : 'Usuario';
        const last_name = demoUser ? demoUser.last_name : 'Demo';
        const role = demoUser ? demoUser.role : 'student';

        const signUpResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name,
              last_name,
              role
            }
          }
        });

        if (signUpResult.error) {
          setLoading(false);
          return { success: false, error: signUpResult.error.message };
        }
        
        userObj = signUpResult.data.user;
        sessionObj = signUpResult.data.session;
      } else {
        setLoading(false);
        return { success: false, error: signInResult.error.message };
      }
    } else {
      userObj = signInResult.data.user;
      sessionObj = signInResult.data.session;
    }

    setSession(sessionObj);
    setUser(userObj ? {
      id: userObj.id,
      first_name: userObj.user_metadata?.first_name || 'Usuario',
      last_name: userObj.user_metadata?.last_name || '',
      role: (userObj.user_metadata?.role || 'student') as any,
      email: userObj.email || '',
      created_at: userObj.created_at,
      updated_at: new Date().toISOString()
    } : null);
    setLoading(false);
    return { success: true };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
