
import React, { useState } from 'react';
import { User, PlanTier } from '../types';
import { auth, db } from '../services/firebase';
import { updateProfile, deleteUser, signOut } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User as UserIcon, Mail, Trash2, Save, Loader2, AlertTriangle, LogOut, CheckCircle, ShieldAlert, Crown, Zap, Sparkles } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPermissionError(false);

    try {
      if (auth.currentUser) {
        // Update Firebase Auth Profile
        await updateProfile(auth.currentUser, { displayName: name });
        
        // Update Firestore Document
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { name, updatedAt: Date.now() });

        onUpdate({ ...user, name });
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      console.error("Update Error:", err);
      if (err.code === 'permission-denied') {
        setPermissionError(true);
        setErrorMsg("Permission Denied: Ensure Firestore Security Rules allow user updates.");
      } else {
        setErrorMsg("Failed to update profile. Please try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    setPermissionError(false);
    try {
      if (auth.currentUser) {
        // Delete Firestore Document
        await deleteDoc(doc(db, 'users', user.uid));
        
        // Delete Firebase Auth User
        await deleteUser(auth.currentUser);
        
        onLogout();
      }
    } catch (err: any) {
      console.error("Delete Error:", err);
      if (err.code === 'permission-denied') {
        setPermissionError(true);
        setErrorMsg("Permission Denied: Unable to delete database entry.");
      } else if (err.code === 'auth/requires-recent-login') {
        setErrorMsg("Please re-login to verify your identity before deleting your account.");
      } else {
        setErrorMsg("Failed to delete account. Please try again.");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const tierStyles = {
    [PlanTier.FREE]: { icon: <Zap className="w-4 h-4" />, label: 'Standard Free', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    [PlanTier.PLUS]: { icon: <Sparkles className="w-4 h-4" />, label: 'Artha Plus', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    [PlanTier.PREMIUM]: { icon: <Crown className="w-4 h-4" />, label: 'Elite Premium', color: 'bg-amber-50 text-amber-700 border-amber-200' }
  };

  const currentTier = user.planTier || PlanTier.FREE;
  const tierStyle = tierStyles[currentTier];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-10 text-white relative">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl border-4 border-white/10">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black tracking-tight">{user.name}</h2>
                <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${tierStyle.color}`}>
                   {tierStyle.icon} {tierStyle.label}
                </div>
              </div>
              <p className="text-blue-300 font-medium text-sm flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="p-10 space-y-10">
          <form onSubmit={handleUpdate} className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Profile Settings
            </h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none font-bold text-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address (Read-only)</label>
              <div className="relative opacity-60">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={user.email} 
                  disabled
                  className="w-full pl-12 pr-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl cursor-not-allowed font-bold text-slate-500"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Plan Benefits</h4>
                  <button type="button" className="text-[9px] font-black text-blue-600 uppercase">Modify Plan</button>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Architect Slots</p>
                     <p className="text-xl font-black text-slate-800">
                        {currentTier === PlanTier.FREE ? '3' : currentTier === PlanTier.PLUS ? '5' : '10'} Slots
                     </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Audit Slots</p>
                     <p className="text-xl font-black text-slate-800">
                        {currentTier === PlanTier.FREE ? '2' : currentTier === PlanTier.PLUS ? '5' : '10'} Slots
                     </p>
                  </div>
               </div>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in fade-in zoom-in">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-bold">{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className={`p-4 rounded-2xl flex flex-col gap-3 animate-in shake ${permissionError ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-rose-50 border border-rose-100 text-rose-600'}`}>
                <div className="flex items-center gap-3">
                  {permissionError ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                  <p className="text-sm font-bold">{errorMsg}</p>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isUpdating || name === user.name}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Profile
            </button>
          </form>

          <div className="pt-10 border-t border-slate-100 space-y-6">
            <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h3>
            
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-4 bg-white text-rose-600 border border-rose-100 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-50 transition-all"
              >
                <Trash2 className="w-5 h-5" />
                Delete My Account
              </button>
            ) : (
              <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2rem] space-y-6 animate-in zoom-in">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-600 rounded-xl text-white">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-rose-900 leading-tight">Are you absolutely sure?</h4>
                    <p className="text-sm text-rose-600 font-medium mt-1">This action is permanent and will delete all your saved portfolio plans and profile data from our servers.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 py-4 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Yes, Delete Forever
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={onLogout}
          className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout Session
        </button>
      </div>
    </div>
  );
};

export default Profile;
