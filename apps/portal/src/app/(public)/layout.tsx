import React from "react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-2xl">
                {/* Brand Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20 mb-4">
                        <span className="text-white font-black text-3xl italic">S</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">
                        ROYAL SUZUKY
                    </h2>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                        Official Service Portal
                    </p>
                </div>

                {children}

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} Royal Suzuky Dealership System. All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
