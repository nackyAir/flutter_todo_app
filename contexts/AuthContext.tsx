import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // メールリンク認証
  sendEmailLink: (email: string) => Promise<void>;
  signInWithLink: (email: string, link: string) => Promise<void>;
  // メール＋パスワード認証
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  // 共通
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Starting auth state monitoring...');
    
    try {
      // Firebase Auth の状態監視
      const unsubscribe = onAuthStateChanged(
        auth,
        (user: User | null) => {
          console.log('🔄 Auth state changed:', user ? `✅ Logged in: ${user.email}` : '❌ Not logged in');
          setUser(user);
          setLoading(false);
        },
        (error: Error) => {
          console.error('❌ Auth state change error:', error);
          setLoading(false);
        }
      );

      return () => {
        console.log('🛑 AuthProvider: Stopping auth state monitoring');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ Firebase Auth setup error in AuthProvider:', error);
      setLoading(false);
    }
  }, []);

  // メールリンク認証
  const sendEmailLink = async (email: string) => {
    const actionCodeSettings = {
      url: 'https://flutter-todo-app-7a5e9.firebaseapp.com/auth',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      await AsyncStorage.setItem('emailForSignIn', email);
      console.log('📧 Email link sent successfully');
    } catch (error) {
      console.error('❌ Email link sending error:', error);
      throw error;
    }
  };

  const signInWithLink = async (email: string, link: string) => {
    try {
      if (isSignInWithEmailLink(auth, link)) {
        await signInWithEmailLink(auth, email, link);
        await AsyncStorage.removeItem('emailForSignIn');
        console.log('✅ Sign in with link successful');
      }
    } catch (error) {
      console.error('❌ Sign in with link error:', error);
      throw error;
    }
  };

  // メール＋パスワード認証
  const signInWithPassword = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in with password successful');
    } catch (error) {
      console.error('❌ Sign in with password error:', error);
      throw error;
    }
  };

  const signUpWithPassword = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign up with password successful');
    } catch (error) {
      console.error('❌ Sign up with password error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
    } catch (error) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
  };

  // 共通
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log('👋 Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    sendEmailLink,
    signInWithLink,
    signInWithPassword,
    signUpWithPassword,
    resetPassword,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 