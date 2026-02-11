import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePic: string;
    isAdmin: boolean;
}

interface RegistrationData {
    status: 'confirmed' | 'pending' | 'rejected' | string;
    ticketId: string;
    [key: string]: any;
}

interface AuthContextType {
    user: UserData | null;
    login: (data: UserData) => void;
    logout: () => void;
    isLoggedIn: boolean;
    isAdmin: boolean;
    isRegistered: boolean;
    registrationData: RegistrationData | null;
    setIsRegistered: (value: boolean) => void;
    setRegistrationData: (data: RegistrationData | null) => void;
    loading: boolean;
    checkRegistration: (uid: string) => Promise<RegistrationData | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
    const [loading, setLoading] = useState(true);

    const checkRegistration = async (uid: string) => {
        try {
            const docRef = doc(db, "registrations", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as RegistrationData;
            }
            return null;
        } catch (error) {
            console.error("Error checking registration:", error);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const names = firebaseUser.displayName?.split(' ') || [];
                // SECURE ADMIN CHECK: Verify UID against authoritative 'admins' collection
                const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
                const isAdminStatus = adminDoc.exists();

                const userData = {
                    uid: firebaseUser.uid,
                    firstName: names[0] || (isAdminStatus ? 'Admin' : 'Observer'),
                    lastName: names.slice(1).join(' ') || '',
                    email: firebaseUser.email || '',
                    profilePic: firebaseUser.photoURL || '',
                    isAdmin: isAdminStatus
                };
                setUser(userData);

                // Check if user is already registered in Firestore
                const regData = await checkRegistration(firebaseUser.uid);
                if (regData) {
                    setIsRegistered(true);
                    setRegistrationData(regData);
                } else {
                    setIsRegistered(false);
                    setRegistrationData(null);
                }
            } else {
                setUser(null);
                setIsRegistered(false);
                setRegistrationData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (data: UserData) => {
        setUser(data);
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setIsRegistered(false);
            setRegistrationData(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isLoggedIn: !!user,
            isAdmin: !!user?.isAdmin,
            isRegistered,
            registrationData,
            setIsRegistered,
            setRegistrationData,
            loading,
            checkRegistration
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
