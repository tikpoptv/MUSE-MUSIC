'use client';

import { ChartArea, Bot, Music, UserPen, PencilLine, HardDrive } from 'lucide-react';


export default function AdminMenuBar() {

    return (
        <div className="w-full px-8 sm:px-12 lg:px-16">
            <div className="flex flex-wrap justify-center gap-4 border-1 border-violet-500 rounded-full p-2">

                {[
                    { icon: ChartArea, label: "Dashboard" },
                    { icon: Bot, label: "Analysis" },
                    { icon: Music, label: "Song Approved" },
                    { icon: UserPen, label: "Manage Admin" },
                    { icon: PencilLine, label: "Edit Prompt" },
                    { icon: HardDrive, label: "Server Status" }
                ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={idx}
                            className="flex-1 flex-[1_1_0] bg-violet-600 rounded-full flex items-center justify-center gap-2 px-4 py-3 min-w-[120px] sm:min-w-[150px] md:min-w-[180px]"
                        >
                            <Icon className="text-white w-5 h-5" />
                            <p className="text-white text-xs xs:text-base font-semibold">{item.label}</p>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}