import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper — persist the Firebase ID-token so Axios sends it automatically
  const persistSession = async (fbUser, backendUser) => {
    const idToken = await fbUser.getIdToken();
    localStorage.setItem('nest_token', idToken);
    localStorage.setItem('nest_user', JSON.stringify(backendUser));
    setUser(backendUser);
    setFirebaseUser(fbUser);
    setIsAuthenticated(true);
  };

  // Sync backend user whenever Firebase auth state changes (also handles token refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken(/* forceRefresh */ true);
          localStorage.setItem('nest_token', idToken);

          // Verify / sync with our backend
          const res = await authAPI.getMe();
          const backendUser = res.data.data;
          localStorage.setItem('nest_user', JSON.stringify(backendUser));
          setFirebaseUser(fbUser);
          setUser(backendUser);
          setIsAuthenticated(true);
        } catch {
          // Backend doesn't know this user yet (first Google sign-in before
          // the /firebase-login endpoint is hit). Keep Firebase session but
          // wait for explicit login/register to sync.
          const savedUser = localStorage.getItem('nest_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
          }
          setFirebaseUser(fbUser);
        }
      } else {
        localStorage.removeItem('nest_token');
        localStorage.removeItem('nest_user');
        setUser(null);
        setFirebaseUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── Email / Password Login ───
  const login = useCallback(async (email, password) => {
    // 1. Authenticate with Firebase
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    localStorage.setItem('nest_token', idToken);

    // 2. Hit our backend (which verifies the Firebase token)
    const res = await authAPI.firebaseLogin({ idToken });
    const backendUser = res.data.data.user;

    await persistSession(cred.user, backendUser);
    return backendUser;
  }, []);

  // ─── Email / Password Register ───
  const register = useCallback(async (data) => {
    const { firstName, lastName, email, password, role } = data;

    // 1. Create Firebase user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await fbUpdateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
    const idToken = await cred.user.getIdToken();
    localStorage.setItem('nest_token', idToken);

    // 2. Create in our backend
    const res = await authAPI.firebaseRegister({
      idToken,
      firstName,
      lastName,
      role,
    });
    const backendUser = res.data.data.user;

    await persistSession(cred.user, backendUser);
    return backendUser;
  }, []);

  // ─── Google Sign-In ───
  const loginWithGoogle = useCallback(async (role = 'student') => {
    const cred = await signInWithPopup(auth, googleProvider);
    const idToken = await cred.user.getIdToken();
    localStorage.setItem('nest_token', idToken);

    // The backend /firebase-login endpoint upserts the user
    const res = await authAPI.firebaseLogin({ idToken, role });
    const backendUser = res.data.data.user;

    await persistSession(cred.user, backendUser);
    return backendUser;
  }, []);

  // ─── Logout ───
  const logout = useCallback(async () => {
    await signOut(auth);
    localStorage.removeItem('nest_token');
    localStorage.removeItem('nest_user');
    setUser(null);
    setFirebaseUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('nest_user', JSON.stringify(userData));
  }, []);

  const value = {
    user,
    firebaseUser,
    loading,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
