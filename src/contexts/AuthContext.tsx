import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        const userRef = doc(db, 'users', fUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // First time login: Create profile as pending, or admin if it's the bootstrapped email
            const email = fUser.email;
            const isBootstrapped = email === 'marcospereirahubner@gmail.com';
            
            const initialProfile: UserProfile = {
              uid: fUser.uid,
              displayName: fUser.displayName || 'Novo Servo',
              email: fUser.email,
              photoURL: fUser.photoURL,
              phone: '',
              celula: '',
              areaInteresse: '',
              role: isBootstrapped ? 'admin' : 'servo',
              status: isBootstrapped ? 'ativo' : 'pendente',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            
            await setDoc(userRef, initialProfile);
            setUser(initialProfile);
          } else {
            // User exists, update lastLoginAt and load
            const currentData = userSnap.data() as UserProfile;
            const updatedData = {
              ...currentData,
              lastLoginAt: new Date().toISOString(),
              displayName: fUser.displayName || currentData.displayName,
              photoURL: fUser.photoURL || currentData.photoURL,
            };
            
            await setDoc(userRef, { 
              lastLoginAt: updatedData.lastLoginAt,
              displayName: updatedData.displayName,
              photoURL: updatedData.photoURL
            }, { merge: true });
            
            setUser(updatedData);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          // Fallback if rules or connection fails in development/setup phase
          setUser({
            uid: fUser.uid,
            displayName: fUser.displayName || 'Servo Local',
            email: fUser.email,
            photoURL: fUser.photoURL,
            role: fUser.email === 'marcospereirahubner@gmail.com' ? 'admin' : 'servo',
            status: 'ativo', // Allow browsing in development if offline
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
      const updatePayload = {
        ...details,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(userRef, updatePayload);
      setUser(prev => prev ? { ...prev, ...updatePayload } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, loginWithGoogle, logout, updateProfileDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
