import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import { 
  Bell, Moon, Lock, HelpCircle, ChevronRight, User, 
  Fingerprint, Smartphone, Save, Shield, HardDrive, Edit2, X, Check, Loader2
} from 'lucide-react';

interface SettingsProps {
  onMenuClick: () => void;
  userName: string;
  onToggleTheme: () => void;
  isDark: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ onMenuClick, userName, onToggleTheme, isDark }) => {
  // State for Profile Edit
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState("staff@showroom.com");
  
  // State for Toggles
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [storageGranted, setStorageGranted] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  
  // State for Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  // Initialize settings from local storage and browser APIs
  useEffect(() => {
    // Check Biometrics
    const storedBio = localStorage.getItem('service_biometrics_enabled');
    setBiometrics(storedBio === 'true');

    // Check Storage Persistence
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(persistent => {
        setStorageGranted(persistent);
      });
    }
  }, []);

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Persist to local storage in real app
    localStorage.setItem('service_user', name);
    // Show toast (simulated)
    alert("Profile saved successfully!");
  };

  const requestStorage = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      setStorageGranted(isPersisted);
      if (isPersisted) {
        alert("Storage permission granted! App data will be preserved even when device storage is low.");
      } else {
        alert("Storage permission denied. The browser may automatically clear data if space runs low.");
      }
    } else {
      alert("Persistent storage API is not supported in this browser.");
    }
  };

  const toggleBiometrics = async () => {
    if (bioLoading) return;
    
    if (!biometrics) {
      setBioLoading(true);
      
      // 1. Check if browser supports WebAuthn
      if (!window.PublicKeyCredential) {
        alert("Biometric authentication is not supported on this device or browser.");
        setBioLoading(false);
        return;
      }

      // 2. Check if platform authenticator (TouchID/FaceID) is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        alert("No biometric sensor detected or screen lock not set up. Please enable screen lock in your device settings.");
        setBioLoading(false);
        return;
      }

      try {
        // Generate random challenge
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // WebAuthn registration options to prompt user verification (Fingerprint/FaceID)
        const publicKey: PublicKeyCredentialCreationOptions = {
          challenge: challenge,
          rp: {
            name: "ServiceMate Pro",
          },
          user: {
            id: new TextEncoder().encode(name),
            name: email,
            displayName: name,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Forces device biometrics
            requireResidentKey: false,
            userVerification: "required" // Forces the prompt
          },
          timeout: 60000,
          attestation: "none"
        };

        // This triggers the OS prompt
        const credential = await navigator.credentials.create({ publicKey });

        if (credential) {
          setBiometrics(true);
          localStorage.setItem('service_biometrics_enabled', 'true');
          alert("Fingerprint authentication enabled successfully.");
        }
      } catch (err) {
        console.error("Biometric setup failed:", err);
        // Do not alert if user cancelled, just log it. 
        // Or specific alert if it wasn't a cancellation.
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
             // User cancelled or timed out
        } else {
             alert("Biometric verification failed. Please try again.");
        }
      } finally {
        setBioLoading(false);
      }
    } else {
      // Disable Biometrics - Just turn it off
      setBiometrics(false);
      localStorage.removeItem('service_biometrics_enabled');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 pb-10">
      <TopBar onMenuClick={onMenuClick} title="Settings" />
      
      <div className="p-4 space-y-6 animate-slide-up">
        
        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors relative overflow-hidden">
           {/* Decorative Background for Profile */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-3xl mb-3 shadow-inner">
              {name.charAt(0)}
            </div>
            
            {!isEditing ? (
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">{name}</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">Senior Technician</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{email}</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-medium rounded-full flex items-center mx-auto hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit2 size={12} className="mr-2" /> Edit Profile
                </button>
              </div>
            ) : (
              <div className="w-full space-y-3 animate-fade-in">
                <div>
                  <label className="text-xs text-gray-500 dark:text-slate-400 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-slate-400 ml-1">Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-2 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-lg">Cancel</button>
                  <button onClick={handleSaveProfile} className="flex-1 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">Save Changes</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preferences Group */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1 font-display">Preferences</h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
            
            {/* Notifications */}
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg mr-3">
                  <Bell size={18} />
                </div>
                <span className="font-medium text-gray-700 dark:text-slate-200">Notifications</span>
              </div>
              <div 
                onClick={() => setNotifications(!notifications)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-700'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>
            
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <div className="flex items-center">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg mr-3">
                  <Moon size={18} />
                </div>
                <span className="font-medium text-gray-700 dark:text-slate-200">Dark Mode</span>
              </div>
              <div 
                onClick={onToggleTheme}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isDark ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'}`}
              >
                 <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1 font-display">Privacy & Security</h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
            
            {/* Biometrics */}
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg mr-3">
                  <Fingerprint size={18} />
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-slate-200 block">Biometric Login</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">Use fingerprint/face ID</span>
                </div>
              </div>
              <div 
                onClick={toggleBiometrics}
                className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${biometrics ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'} ${bioLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${biometrics ? 'translate-x-5' : 'translate-x-0'}`}>
                   {bioLoading ? (
                      <Loader2 size={12} className="animate-spin text-emerald-600" />
                   ) : biometrics ? (
                      <Fingerprint size={12} className="text-emerald-600 animate-fade-in" />
                   ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-400" />
                   )}
                </div>
              </div>
            </div>

            {/* Persistent Storage Request */}
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg mr-3">
                  <HardDrive size={18} />
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-slate-200 block">Persistent Storage</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">Keep data for offline access</span>
                </div>
              </div>
              <button 
                onClick={requestStorage}
                disabled={storageGranted}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  storageGranted 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 cursor-default' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                }`}
              >
                {storageGranted ? 'Granted' : 'Enable'}
              </button>
            </div>

            {/* Change Password */}
            <div onClick={() => setShowPasswordModal(true)} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <div className="flex items-center">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg mr-3">
                  <Lock size={18} />
                </div>
                <span className="font-medium text-gray-700 dark:text-slate-200">Change Password</span>
              </div>
              <ChevronRight size={18} className="text-gray-400 dark:text-slate-600" />
            </div>

            {/* App Permissions (Visual) */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800/30">
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 mb-3 uppercase">Device Permissions</p>
              <div className="flex flex-wrap gap-2">
                 <span className={`px-2 py-1 border rounded text-xs flex items-center transition-colors ${storageGranted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400'}`}>
                    <HardDrive size={10} className="mr-1" /> Storage
                 </span>
                 <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-xs text-gray-500 dark:text-slate-400 flex items-center">
                    <Bell size={10} className="mr-1" /> Notifications
                 </span>
                 <span className={`px-2 py-1 border rounded text-xs flex items-center transition-colors ${biometrics ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400'}`}>
                    <Fingerprint size={10} className="mr-1" /> Biometrics
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Modal (Overlay) */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-slide-up relative border border-gray-100 dark:border-slate-700">
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 font-display">Change Password</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Ensure your new password is at least 8 characters.</p>
              
              <div className="space-y-3">
                <input 
                  type="password" 
                  placeholder="Current Password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input 
                  type="password" 
                  placeholder="New Password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button 
                onClick={() => { setShowPasswordModal(false); alert("Password updated"); }}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-transform active:scale-95"
              >
                Update Password
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};