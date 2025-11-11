"use client";

import { useEffect } from 'react';
import AdminMenu from '@/components/AdminMenu';
import ServerStatus from '@/components/ServerStatus';
import { HardDrive } from 'lucide-react';

export default function ServerStatusPage() {
    useEffect(() => {
        const scrollToTop = () => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        };
        
        scrollToTop();
        
        requestAnimationFrame(() => {
            scrollToTop();
            setTimeout(() => {
                scrollToTop();
            }, 0);
        });
        
        const timeout1 = setTimeout(scrollToTop, 100);
        const timeout2 = setTimeout(scrollToTop, 300);
        
        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
        };
    }, []);

    return (
        <AdminMenu>
            <div className="w-full">
                <div className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-violet-600 mb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10">
                    <HardDrive className="w-10 h-10" />
                    <span>Server Status</span>
                </div>

                <div className="px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10">
                    <ServerStatus />
                </div>
            </div>
        </AdminMenu>
    );
}

