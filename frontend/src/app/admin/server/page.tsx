"use client";

import { useEffect, useState } from 'react';
import AdminMenu from '@/components/AdminMenu';
import ServerStatus from '@/components/ServerStatus';
import { HardDrive, RefreshCw, AlertCircle, Info, AlertTriangle, Bug, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminLogsService } from '@/services/adminLogsService';
import type { SystemLog, LogStats, LogFilters } from '@/types/adminLogs';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import toast from 'react-hot-toast';
import { formatDateThai } from '@/utils/dateUtils';

export default function ServerStatusPage() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [logStats, setLogStats] = useState<LogStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<LogFilters>({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);

    const pageSize = 20;

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

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const result = await adminLogsService.getLogs({
                ...filters,
                page: currentPage,
                limit: pageSize,
                search: searchQuery || undefined
            });

            if (result) {
                setLogs(result.logs);
                setTotalPages(result.pagination.totalPages);
                setTotal(result.pagination.total);
            }
        } catch {
            toast.error('Failed to fetch logs');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const stats = await adminLogsService.getLogStats();
            if (stats) {
                setLogStats(stats);
            }
        } catch {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch log stats');
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, filters.level, filters.category, filters.sortBy, filters.sortOrder]);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchLogs();
                fetchStats();
            }, 10000); // Refresh every 10 seconds

            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh, currentPage, filters.level, filters.category, searchQuery]);

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'warn':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'info':
                return <Info className="w-4 h-4 text-blue-500" />;
            case 'debug':
                return <Bug className="w-4 h-4 text-gray-500" />;
            default:
                return <Info className="w-4 h-4" />;
        }
    };

    const getLevelBadge = (level: string) => {
        const baseClasses = "px-2 py-0.5 rounded text-xs font-medium";
        switch (level) {
            case 'error':
                return `${baseClasses} bg-red-100 text-red-800`;
            case 'warn':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'info':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'debug':
                return `${baseClasses} bg-gray-100 text-gray-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const formatDate = (dateString: string) => {
        return formatDateThai(dateString, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC'
        });
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchLogs();
    };

    return (
        <AdminMenu>
            <div className="w-full space-y-4 sm:space-y-6">
                <div className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-violet-600 mb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10">
                    <HardDrive className="w-10 h-10" />
                    <span>Server Status</span>
                </div>

                <div className="px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 space-y-4 sm:space-y-6">
                    <ServerStatus />

                    {/* Log Statistics */}
                    {logStats && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Errors (24h)</CardDescription>
                                    <CardTitle className="text-2xl">{logStats.errorCount}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>API Calls (24h)</CardDescription>
                                    <CardTitle className="text-2xl">{logStats.apiCallsCount}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Total Logs</CardDescription>
                                    <CardTitle className="text-2xl">{total}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                    )}

                    {/* Logs Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                <div>
                                    <CardTitle>System Logs</CardTitle>
                                    <CardDescription>Application logs and events</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setAutoRefresh(!autoRefresh);
                                            if (!autoRefresh) {
                                                toast.success('Auto-refresh enabled');
                                            }
                                        }}
                                        className={autoRefresh ? 'bg-violet-50 border-violet-200' : ''}
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                                        {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            fetchLogs();
                                            fetchStats();
                                            toast.success('Logs refreshed');
                                        }}
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="mb-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search logs..."
                                            value={searchQuery}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch();
                                                }
                                            }}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <Select
                                    value={filters.level || 'all'}
                                    onValueChange={(value) => {
                                        setFilters({ ...filters, level: value === 'all' ? undefined : value as 'info' | 'error' | 'warn' | 'debug' });
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        <SelectItem value="error">Error</SelectItem>
                                        <SelectItem value="warn">Warning</SelectItem>
                                        <SelectItem value="info">Info</SelectItem>
                                        <SelectItem value="debug">Debug</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.category || 'all'}
                                    onValueChange={(value) => {
                                        setFilters({ ...filters, category: value === 'all' ? undefined : value });
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="api">API</SelectItem>
                                        <SelectItem value="database">Database</SelectItem>
                                        <SelectItem value="auth">Auth</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                        <SelectItem value="security">Security</SelectItem>
                                        <SelectItem value="performance">Performance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Logs Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Level</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Message</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Path</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                                                    Time
                                                    <span className="text-[10px] font-normal text-gray-400 ml-1">(UTC)</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y">
                                            {isLoading && logs.length === 0 ? (
                                                <tr key="loading">
                                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                                        Loading logs...
                                                    </td>
                                                </tr>
                                            ) : logs.length === 0 ? (
                                                <tr key="empty">
                                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                                        No logs found
                                                    </td>
                                                </tr>
                                            ) : (
                                                logs.map((log, index) => {
                                                    // Fallback key: use logID, or logid (if backend returns lowercase), or index
                                                    const logKey = log.logID || (log as SystemLog & { logid?: string }).logid || `log-${index}`;
                                                    return (
                                                    <tr key={logKey} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                {getLevelIcon(log.level)}
                                                                <span className={getLevelBadge(log.level)}>
                                                                    {log.level.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {log.category || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate" title={log.message}>
                                                            {log.message}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={log.path || ''}>
                                                            {log.path || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {log.statusCode ? (
                                                                <span className={`px-2 py-0.5 rounded text-xs ${
                                                                    log.statusCode >= 500 ? 'bg-red-100 text-red-800' :
                                                                    log.statusCode >= 400 ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}>
                                                                    {log.statusCode}
                                                                </span>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            {formatDate(log.createdAt)}
                                                            <span className="text-[10px] text-gray-400 ml-1">UTC</span>
                                                        </td>
                                                    </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} logs
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1 || isLoading}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <div className="text-sm text-gray-600">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages || isLoading}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminMenu>
    );
}

