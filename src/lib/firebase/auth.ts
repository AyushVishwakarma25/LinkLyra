import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateAuthProfile,
  sendPasswordResetEmail,
  updatePassword as updateAuthPassword,
  sendEmailVerification,
  deleteUser as deleteAuthUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  auth,
  db,
  googleProvider,
  functions,
  sanitizeForFirestore,
  DbProfile,
} from './app';
import {
  validateUsername,
  suggestAvailableUsername,
} from '../username';

export const authService = {
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Account Provisioning (Email Sign-up and Google Sign-in)
  async provisionAccount(user: User, desiredUsername?: string): Promise<{ profile: DbProfile; username: string }> {
    const rawCandidate = desiredUsername || user.displayName || user.email?.split('@')[0] || 'creator';

    const finalUsername = await suggestAvailableUsername(
      rawCandidate,
      async (candidate) => {
        const snap = await getDoc(doc(db, 'usernames', candidate));
        return !snap.exists();
      },
      user.uid
    );

    const validation = validateUsername(finalUsername);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid username generated.');
    }

    const fullName = user.displayName || 'Creator';
    const avatarUrl =
      user.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

    const newProfile: DbProfile = {
      id: user.uid,
      username: finalUsername,
      full_name: fullName,
      bio: '',
      avatar_url: avatarUrl,
      theme: 'warm',
      socials: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Atomic transaction: claim username doc and initialize canonical users/{uid} & pages/{uid}
    await runTransaction(db, async (tx) => {
      const usernameRef = doc(db, 'usernames', finalUsername);
      const usernameSnap = await tx.get(usernameRef);
      if (usernameSnap.exists()) {
        const data = usernameSnap.data();
        if (data?.uid && data.uid !== user.uid) {
          throw new Error(`Username @${finalUsername} is already taken. Please choose another.`);
        }
      }

      // Claim username
      tx.set(usernameRef, {
        userId: user.uid,
        uid: user.uid,
        pageId: user.uid,
        username: finalUsername,
        createdAt: serverTimestamp(),
      });

      // 1. Canonical private account: users/{uid}
      tx.set(
        doc(db, 'users', user.uid),
        sanitizeForFirestore({
          displayName: fullName,
          email: user.email || '',
          photoURL: avatarUrl,
          username: finalUsername,
          plan: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      );

      // 2. Canonical public page: pages/{uid}
      tx.set(
        doc(db, 'pages', user.uid),
        sanitizeForFirestore({
          userId: user.uid,
          username: finalUsername,
          title: fullName,
          bio: '',
          avatarUrl,
          isPublished: true,
          themeId: 'warm',
          backgroundType: 'color',
          backgroundValue: '#ECE7DC',
          fontFamily: 'Plus Jakarta Sans',
          textColor: '#1C1E22',
          buttonStyle: 'rounded',
          buttonColor: '#5E4BF7',
          socials: {},
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      );
    });

    return { profile: newProfile, username: finalUsername };
  },

  async signUp(
    email: string,
    pass: string,
    fullNameOrUsername?: string,
    desiredUsername?: string
  ): Promise<User> {
    const fullName = desiredUsername !== undefined ? fullNameOrUsername : undefined;
    const targetUsername = desiredUsername !== undefined ? desiredUsername : fullNameOrUsername;

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;

    try {
      if (fullName) {
        await updateAuthProfile(user, { displayName: fullName });
      }
      await this.provisionAccount(user, targetUsername);
      sendEmailVerification(user).catch((e) => console.warn('Verification email notice:', e));
    } catch (err: unknown) {
      console.error('Account provisioning error on sign up:', err);
      try {
        await deleteAuthUser(user);
      } catch (delErr) {
        console.warn('Rollback user delete notice:', delErr);
      }
      const message = err instanceof Error ? err.message : 'Failed to complete registration.';
      throw new Error(message);
    }

    return user;
  },

  async signIn(email: string, pass: string) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  },

  async signInWithGoogle(desiredUsername?: string): Promise<{ user: User; profile: DbProfile }> {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;

    let profile: DbProfile;
    const userDocSnap = await getDoc(doc(db, 'users', user.uid));
    if (!userDocSnap.exists()) {
      const provisioned = await this.provisionAccount(user, desiredUsername);
      profile = provisioned.profile;
    } else {
      const pageSnap = await getDoc(doc(db, 'pages', user.uid));
      if (pageSnap.exists()) {
        const pageData = pageSnap.data();
        profile = {
          id: user.uid,
          username: pageData.username || '',
          full_name: pageData.title || '',
          bio: pageData.bio || '',
          avatar_url: pageData.avatarUrl || '',
          theme: pageData.themeId || 'warm',
          socials: pageData.socials || {},
          created_at: pageData.createdAt ? String(pageData.createdAt) : new Date().toISOString(),
          updated_at: pageData.updatedAt ? String(pageData.updatedAt) : new Date().toISOString(),
        };
      } else {
        const provisioned = await this.provisionAccount(user, desiredUsername);
        profile = provisioned.profile;
      }
    }

    return { user, profile };
  },

  async signOut() {
    await firebaseSignOut(auth);
  },

  async changePassword(newPass: string) {
    if (!auth.currentUser) throw new Error('Not authenticated');
    await updateAuthPassword(auth.currentUser, newPass);
  },

  async updateAccountPassword(newPass: string) {
    if (!auth.currentUser) throw new Error('No user is currently authenticated.');
    await updateAuthPassword(auth.currentUser, newPass);
  },

  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  },

  async sendPasswordReset(email: string) {
    await sendPasswordResetEmail(auth, email);
  },

  async sendEmailVerificationLink() {
    if (!auth.currentUser) throw new Error('Not authenticated');
    await sendEmailVerification(auth.currentUser);
  },

  async sendVerificationEmail() {
    if (!auth.currentUser) throw new Error('No user is currently authenticated.');
    await sendEmailVerification(auth.currentUser);
  },

  async deleteAccount() {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const deleteAccountFn = httpsCallable(functions, 'deleteAccount');
    await deleteAccountFn();
    await firebaseSignOut(auth);
  },

  async deleteUserAccount(userId: string) {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error('User is not authorized or not signed in.');
    }
    const deleteAccountFn = httpsCallable(functions, 'deleteAccount');
    await deleteAccountFn();
    await firebaseSignOut(auth);
  },
};
