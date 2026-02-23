'use client';

import React from 'react';
import { GOALS } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import AnimatedNumber from '../ui/AnimatedNumber';

const GoalsAndTeam = () => {
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-card border border-surface-border dark:border-dark-border h-full flex flex-col">
            <h3 className="text-lg font-bold text-ink-heading dark:text-white mb-6">Financial Goals</h3>
            <div className="space-y-6 flex-1">
                {GOALS.map((goal, idx) => {
                    const percent = Math.round((goal.current / goal.target) * 100);
                    return (
                        <div key={idx}>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-sm font-bold text-ink-heading dark:text-white">{goal.title}</p>
                                    <p className="text-xs text-ink-muted">Target: {goal.date}</p>
                                </div>
                                <span className="text-sm font-bold text-ink-body dark:text-gray-300">
                                    <AnimatedNumber value={percent} format={(val: number) => val.toFixed(0)} />%
                                </span>
                            </div>
                            <div className="w-full bg-surface-border dark:bg-dark-border h-2 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full bg-brand", goal.color)} style={{ width: `${percent}%` }}></div>
                            </div>
                            <div className="mt-1 text-xs text-ink-muted text-right">
                                $<AnimatedNumber value={goal.current} format={(val: number) => val.toLocaleString()} /> / ${goal.target.toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-surface-border dark:border-dark-border">
                <h4 className="text-sm font-bold text-ink-heading dark:text-white mb-4">Team Members</h4>
                <div className="flex -space-x-2 overflow-hidden mb-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Image
                            key={i}
                            width={32}
                            height={32}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-dark-card"
                            src={`https://picsum.photos/100/100?random=${i}`}
                            alt="team member"
                        />
                    ))}
                    <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-dark-card bg-surface-border dark:bg-dark-border text-xs font-medium text-ink-muted">
                        +5
                    </div>
                </div>
                <button className="w-full py-2 text-sm text-brand font-medium bg-brand-soft/50 hover:bg-brand-soft rounded-lg transition-colors">
                    Manage Team
                </button>
            </div>
        </div>
    );
};

export default GoalsAndTeam;
