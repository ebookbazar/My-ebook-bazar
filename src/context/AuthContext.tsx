import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  ref, 
  onValue,
  get, 
  set, 
  update, 
  serverTimestamp,
  User 
} from '../firebase';
import { UserProfile, SellerProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | SellerProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  registerUser: (data: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    country: string;
    address: string;
    paymentMethod?: 'bKash' | 'Nagad';
    paymentMobile?: string;
    pass: string;
    referredBy?: string;
  }) => Promise<void>;
  registerSeller: (data: {
    sellerName: string;
    email: string;
    phone: string;
    paymentMethod: 'bKash' | 'Nagad';
    paymentMobile: string;
    pass: string;
    referredBy?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile | SellerProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Recognized initial admin emails or UIDs
const SUPER_ADMIN_EMAILS = ['suma47083@gmail.com', 'admin@ebookbazar.com'];

export function cleanFirebaseData<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanFirebaseData(item)) as any;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = typeof value === 'object' && value !== null ? cleanFirebaseData(value) : value;
      }
    }
    return cleaned as T;
  }
  return data;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | SellerProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load and cache profile without overwriting referral code
  const loadProfile = async (user: User) => {
    try {
      const uid = user.uid;
      const userRef = ref(db, `users/${uid}`);
      const sellerRef = ref(db, `sellers/${uid}`);
      const adminRef = ref(db, `admins/${uid}`);

      const [userSnap, sellerSnap, adminSnap] = await Promise.all([
        get(userRef),
        get(sellerRef),
        get(adminRef)
      ]);

      let prof: UserProfile | SellerProfile | null = null;
      let userIsAdmin = false;

      // Check admin status by DB or recognized email
      if (adminSnap.exists() && adminSnap.val()?.active !== false) {
        userIsAdmin = true;
      } else if (user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        userIsAdmin = true;
        // Ensure registered in admins node
        set(adminRef, {
          email: user.email,
          uid,
          grantedAt: serverTimestamp(),
          active: true
        }).catch(() => {});
      }

      if (sellerSnap.exists()) {
        prof = { uid, ...sellerSnap.val() } as SellerProfile;
      } else if (userSnap.exists()) {
        prof = { uid, ...userSnap.val() } as UserProfile;
        if (prof?.role === 'admin') {
          userIsAdmin = true;
        }
      }

      // If user exists in auth but missing in DB, bootstrap safe profile with permanent referral code
      if (!prof) {
        const autoRef = 'EBK' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const baseProfile: UserProfile = {
          uid,
          username: user.email?.split('@')[0] || 'user',
          fullName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: '',
          country: 'Bangladesh',
          address: '',
          role: userIsAdmin ? 'admin' : 'user',
          referralCode: autoRef,
          affiliateBalance: 0,
          totalEarnings: 0,
          status: 'active',
          createdAt: Date.now()
        };
        await set(userRef, baseProfile);
        prof = baseProfile;
      }

      // Ensure referralCode is never lost or mutated
      if (!prof.referralCode) {
        const savedRef = 'EBK' + Math.random().toString(36).substring(2, 8).toUpperCase();
        prof.referralCode = savedRef;
        update(userRef, { referralCode: savedRef });
        if (prof.role === 'seller') {
          update(sellerRef, { referralCode: savedRef });
        }
      }

      if (userIsAdmin) {
        prof.role = 'admin';
      }

      setUserProfile(prof);
      setIsAdmin(userIsAdmin);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Realtime profile synchronization when user or seller record is updated by Admin
  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const userRef = ref(db, `users/${uid}`);
    const sellerRef = ref(db, `sellers/${uid}`);

    const unsubSeller = onValue(sellerRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setUserProfile(prev => {
          if (!prev) return { uid, ...val };
          return { ...prev, ...val, uid };
        });
      }
    });

    const unsubUser = onValue(userRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setUserProfile(prev => {
          if (!prev) return { uid, ...val };
          // If seller data exists, don't clobber seller-specific fields unless present
          return { ...val, ...prev, ...val, uid };
        });
      }
    });

    return () => {
      unsubSeller();
      unsubUser();
    };
  }, [currentUser]);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (err: any) {
      if ((err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') && SUPER_ADMIN_EMAILS.includes(cleanEmail.toLowerCase())) {
        try {
          cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        } catch {
          throw err;
        }
      } else {
        throw err;
      }
    }
    await loadProfile(cred.user);
  };

  const registerUser = async (data: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    country: string;
    address: string;
    paymentMethod?: 'bKash' | 'Nagad';
    paymentMobile?: string;
    pass: string;
    referredBy?: string;
  }) => {
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-in-use') {
        try {
          cred = await signInWithEmailAndPassword(auth, data.email, data.pass);
        } catch {
          throw new Error('এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে লগইন করুন অথবা পাসওয়ার্ড রিসেট করুন।');
        }
      } else {
        throw authErr;
      }
    }

    const uid = cred.user.uid;
    const autoRef = 'EBK' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const isSuper = SUPER_ADMIN_EMAILS.includes(data.email.toLowerCase());

    const profile: UserProfile = {
      uid,
      username: data.username.trim() || data.email.split('@')[0],
      fullName: data.fullName.trim() || 'User',
      email: data.email.trim(),
      phone: data.phone.trim() || '',
      country: data.country.trim() || 'Bangladesh',
      address: data.address.trim() || '',
      paymentMethod: data.paymentMethod || 'bKash',
      paymentMobile: data.paymentMobile ? data.paymentMobile.trim() : (data.phone ? data.phone.trim() : ''),
      role: isSuper ? 'admin' : 'user',
      referralCode: autoRef,
      affiliateBalance: 0,
      totalEarnings: 0,
      status: 'active',
      createdAt: Date.now()
    };

    if (data.referredBy && data.referredBy.trim()) {
      profile.referredBy = data.referredBy.trim().toUpperCase();
    }

    const cleanedProfile = cleanFirebaseData(profile);
    await set(ref(db, `users/${uid}`), cleanedProfile);

    if (isSuper) {
      await set(ref(db, `admins/${uid}`), { email: data.email, uid, active: true, grantedAt: Date.now() });
    }

    try {
      get(ref(db, 'ebooks/_platformStats')).then((statSnap) => {
        const cur = statSnap.val() || {};
        const newTotal = (typeof cur.totalUsers === 'number' ? cur.totalUsers : 17) + 1;
        update(ref(db, 'ebooks/_platformStats'), { totalUsers: newTotal, updatedAt: Date.now() }).catch(() => {});
      }).catch(() => {});
    } catch {
      // ignore
    }

    await loadProfile(cred.user);
  };

  const registerSeller = async (data: {
    sellerName: string;
    email: string;
    phone: string;
    paymentMethod: 'bKash' | 'Nagad';
    paymentMobile: string;
    pass: string;
    referredBy?: string;
  }) => {
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-in-use') {
        try {
          cred = await signInWithEmailAndPassword(auth, data.email, data.pass);
        } catch {
          throw new Error('এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিয়ে লগইন করুন অথবা অন্য ইমেইল ব্যবহার করুন।');
        }
      } else {
        throw authErr;
      }
    }

    const uid = cred.user.uid;
    const autoRef = 'EBK' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const isSuper = SUPER_ADMIN_EMAILS.includes(data.email.toLowerCase());

    const sellerProfile: SellerProfile = {
      uid,
      username: (data.sellerName || 'seller').replace(/\s+/g, '').toLowerCase(),
      fullName: data.sellerName.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || data.paymentMobile?.trim() || '',
      country: 'Bangladesh',
      address: '',
      role: isSuper ? 'admin' : 'seller',
      referralCode: autoRef,
      affiliateBalance: 0,
      totalEarnings: 0,
      status: 'active',
      createdAt: Date.now(),
      paymentMethod: data.paymentMethod || 'bKash',
      paymentMobile: (data.paymentMobile || '').trim(),
      membershipPlan: 'free',
      uploadLimit: 5,
      balance: 0,
      salesCount: 0,
      withdrawnAmount: 0
    };

    if (data.referredBy && data.referredBy.trim()) {
      sellerProfile.referredBy = data.referredBy.trim().toUpperCase();
    }

    const cleanedSellerProfile = cleanFirebaseData(sellerProfile);

    const updates: Record<string, any> = {};
    updates[`users/${uid}`] = cleanedSellerProfile;
    updates[`sellers/${uid}`] = cleanedSellerProfile;
    if (isSuper) {
      updates[`admins/${uid}`] = { email: data.email, uid, active: true, grantedAt: Date.now() };
    }

    await update(ref(db), updates);

    try {
      get(ref(db, 'ebooks/_platformStats')).then((statSnap) => {
        const cur = statSnap.val() || {};
        const newUsers = (typeof cur.totalUsers === 'number' ? cur.totalUsers : 17) + 1;
        const newSellers = (typeof cur.totalSellers === 'number' ? cur.totalSellers : 7) + 1;
        update(ref(db, 'ebooks/_platformStats'), { totalUsers: newUsers, totalSellers: newSellers, updatedAt: Date.now() }).catch(() => {});
      }).catch(() => {});
    } catch {
      // ignore
    }

    await loadProfile(cred.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileData = async (data: Partial<UserProfile | SellerProfile>) => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const updates: Record<string, any> = {};

    // NEVER overwrite referralCode
    delete data.referralCode;

    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined) {
        updates[`users/${uid}/${key}`] = val;
        if (userProfile?.role === 'seller') {
          updates[`sellers/${uid}/${key}`] = val;
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }
    await loadProfile(currentUser);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await loadProfile(currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      isAdmin,
      loading,
      login,
      registerUser,
      registerSeller,
      logout,
      resetPassword,
      updateProfileData,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
