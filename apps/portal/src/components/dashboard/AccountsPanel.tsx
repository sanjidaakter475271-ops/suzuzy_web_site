'use client';

import React from 'react';
import { CreditCard, Wallet, Plus, Send, ArrowUp } from 'lucide-react';
import { ACCOUNTS } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import AnimatedNumber from '../ui/AnimatedNumber';

const AccountsPanel = () => {
    return (
        <div className="space-y-6 h-full flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACCOUNTS.map((account) => (
                    <div key={account.id} className="bg-white dark:bg-dark-card p-5 rounded-xl border border-surface-border dark:border-dark-border shadow-soft flex flex-col justify-between hover:border-brand transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-brand-soft rounded-lg text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                                {account.type === 'credit' ? <CreditCard size={20} /> : <Wallet size={20} />}
                            </div>
                            <span className="text-xs font-semibold text-ink-muted bg-surface-page dark:bg-dark-page px-2 py-1 rounded">{account.number}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-ink-muted">{account.name}</p>
                            <h4 className="text-xl font-bold text-ink-heading dark:text-white flex items-center">
                                $<AnimatedNumber
                                    value={parseFloat(account.balance.replace(/[^0-9.]/g, ''))}
                                    format={(val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                />
                            </h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-brand-soft/30 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
                <span className="text-sm font-bold text-ink-heading dark:text-white px-2">Quick Actions:</span>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-hover shadow-sm transition-transform active:scale-95">
                        <Plus size={16} /> Add Money
                    </button>
                    <button className="flex items-center gap-2 bg-white dark:bg-dark-card text-ink-body dark:text-white px-4 py-2 rounded-lg text-sm font-medium border border-surface-border dark:border-dark-border hover:bg-surface-hover dark:hover:bg-dark-border transition-colors">
                        <Send size={16} /> Send
                    </button>
                    <button className="flex items-center gap-2 bg-white dark:bg-dark-card text-ink-body dark:text-white px-4 py-2 rounded-lg text-sm font-medium border border-surface-border dark:border-dark-border hover:bg-surface-hover dark:hover:bg-dark-border transition-colors">
                        <ArrowUp size={16} /> Top-up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountsPanel;
