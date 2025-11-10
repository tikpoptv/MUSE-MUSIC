'use client';

import Link from 'next/link';
import { ChartArea, Bot, Music, UserPen, PencilLine, HardDrive } from 'lucide-react';
import { ReactNode } from 'react';

interface AdminMenuBarProps {
    children?: ReactNode;
}

export default function AdminMenuBar({ children }: AdminMenuBarProps) {

    const items = [
        { icon: ChartArea, label: "Dashboard", href: "/admin/dashboard" },
        { icon: Bot, label: "Analysis", href: "/admin/analysis" },
        { icon: Music, label: "Song Approved", href: "/admin/songs" },
        { icon: UserPen, label: "Manage Admin", href: "/admin/manage" },
        { icon: PencilLine, label: "Edit Prompt", href: "/admin/edit-prompt" },
        { icon: HardDrive, label: "Server Status", href: "/admin/server" }
    ];

    return (
        <div className="w-full pt-4 sm:pt-4 md:pt-3 pb-12 sm:pb-16 md:pb-20">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
                <div className="my-4">
                    {/* Mobile: Horizontal scrollable menu */}
                    <div className="block sm:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
                        <div className="flex gap-2 min-w-max border border-violet-500 rounded-full p-1.5 bg-white dark:bg-white">
                            {items.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={idx}
                                        href={item.href}
                                        className="bg-violet-600 hover:bg-violet-700 rounded-full flex items-center justify-center gap-1.5 px-3 py-2 min-w-[80px] transition-colors duration-200"
                                    >
                                        <Icon className="text-white w-4 h-4 flex-shrink-0" />
                                        <p className="text-white text-[10px] font-semibold whitespace-nowrap">{item.label}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tablet & Desktop: Flex wrap menu */}
                    <div className="hidden sm:flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 border border-violet-500 rounded-full p-1.5 sm:p-2 bg-white dark:bg-white">
                        {items.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className="flex-1 flex-[1_1_0] bg-violet-600 hover:bg-violet-700 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 min-w-[120px] sm:min-w-[140px] md:min-w-[160px] lg:min-w-[180px] transition-colors duration-200"
                                >
                                    <Icon className="text-white w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                    <p className="text-white text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap">{item.label}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
