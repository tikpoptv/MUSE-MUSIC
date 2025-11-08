'use client';

import Link from 'next/link';
import { ChartArea, Bot, Music, UserPen, PencilLine, HardDrive } from 'lucide-react';


export default function AdminMenuBar() {

    const items = [
        { icon: ChartArea, label: "Dashboard", href: "/admindashboard" },
        { icon: Bot, label: "Analysis", href: "/adminanalysis" },
        { icon: Music, label: "Song Approved", href: "/admin/songs" },
        { icon: UserPen, label: "Manage Admin", href: "/admin/manage" },
        { icon: PencilLine, label: "Edit Prompt", href: "/adminprompts" },
        { icon: HardDrive, label: "Server Status", href: "/admin/server" }
    ];

    return (
        
            <div className="flex flex-wrap justify-center gap-4 border-1 border-violet-500 rounded-full p-2">

                {items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={idx}
                            href={item.href}
                            className="flex-1 flex-[1_1_0] bg-violet-600 rounded-full flex items-center justify-center gap-2 px-4 py-3 min-w-[120px] sm:min-w-[150px] md:min-w-[180px]"
                        >
                            <Icon className="text-current w-5 h-5" />
                            <p className="text-xs xs:text-base font-semibold">{item.label}</p>
                        </Link>
                    );
                })}

            </div>
        
    );
}
