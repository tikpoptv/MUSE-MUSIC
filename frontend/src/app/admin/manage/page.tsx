"use client";

import { useEffect, useState } from "react";
import AdminMenu from "@/components/AdminMenu";
import AdminCard from "@/components/AdminCard";
import ADD_admin from "@/components/ADD_admin";
import { UserPen } from 'lucide-react';
import { adminManageService } from '@/services/adminManageService';
import { AdminUser } from '@/types/adminManage';
import toast from 'react-hot-toast';

export default function Page() {
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAdminUsers = async () => {
        setIsLoading(true);
        try {
            const users = await adminManageService.getAdminUsers();
            setAdminUsers(users);
        } catch {
            toast.error('Failed to load admin users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminUsers();
    }, []);

    const handleRoleChange = async (userID: string, newRole: 'customer' | 'admin' | 'super_admin') => {
        try {
            if (newRole === 'customer') {
                await adminManageService.removeAdmin(userID);
                toast.success('Admin removed successfully');
            } else {
                await adminManageService.updateUserRole(userID, newRole);
                toast.success('User role updated successfully');
            }
            await fetchAdminUsers();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 
                                (error as { error?: string })?.error || 'Failed to update user role';
            toast.error(errorMessage);
        }
    };

    const handleAdminAdded = () => {
        fetchAdminUsers();
    };

    const getInitials = (name: string | null, username: string) => {
        if (name) {
            const parts = name.trim().split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        }
        return username.substring(0, 2).toUpperCase();
    };

    const getDisplayName = (fullName: string | null, username: string) => {
        return fullName || username;
    };

    return (
        <AdminMenu>
            <div className="w-full">
                <div className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-violet-600 mb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10">
                    <UserPen className="w-10 h-10" />
                    <span>Manage Admin</span>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                    </div>
                ) : adminUsers.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">No admin users found</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-6 mb-6 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10">
                        {adminUsers.map((user) => (
                            <AdminCard
                                key={user.userID}
                                userID={user.userID}
                                name={getDisplayName(user.fullName, user.username)}
                                role={user.role}
                                initials={getInitials(user.fullName, user.username)}
                                onRoleChange={handleRoleChange}
                            />
                        ))}
                </div>
                )}

                <div className="flex flex-wrap justify-center gap-6 mb-6">
                    <ADD_admin onAdminAdded={handleAdminAdded} />
                </div>
            </div>
        </AdminMenu>
    );
}