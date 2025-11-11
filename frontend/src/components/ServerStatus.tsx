'use client';

import { useEffect, useState } from 'react';
import { Server, Database } from 'lucide-react';
import { healthService } from '@/services/healthService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusItem {
  label: string;
  icon: React.ReactNode;
  status: 'ready' | 'error' | 'checking';
}

export default function ServerStatus() {
  const [backendStatus, setBackendStatus] = useState<'ready' | 'error' | 'checking'>('checking');
  const [serverStatus, setServerStatus] = useState<'ready' | 'error' | 'checking'>('checking');
  const [dataStatus, setDataStatus] = useState<'ready' | 'error' | 'checking'>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const health = await healthService.getHealth();
        
        if (health) {
          setBackendStatus(health.status === 'OK' || health.status === 'WARNING' ? 'ready' : 'error');
          setServerStatus(health.status === 'OK' ? 'ready' : 'error');
          setDataStatus(health.database ? 'ready' : 'error');
        } else {
          setBackendStatus('error');
          setServerStatus('error');
          setDataStatus('error');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Health check error:', error);
        setBackendStatus('error');
        setServerStatus('error');
        setDataStatus('error');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const statusItems: StatusItem[] = [
    {
      label: 'Backend',
      icon: <Server className="w-5 h-5" />,
      status: backendStatus
    },
    {
      label: 'Server',
      icon: <Server className="w-5 h-5" />,
      status: serverStatus
    },
    {
      label: 'Data',
      icon: <Database className="w-5 h-5" />,
      status: dataStatus
    }
  ];

  const getStatusBadge = (status: 'ready' | 'error' | 'checking') => {
    if (status === 'ready') {
      return (
        <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap">
          Ready
        </span>
      );
    } else if (status === 'error') {
      return (
        <span className="bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap">
          Error
        </span>
      );
    } else {
      return (
        <span className="bg-gray-100 text-gray-800 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap">
          Checking...
        </span>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {statusItems.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 sm:p-4 flex flex-row items-center justify-between gap-2 sm:gap-3 min-w-0"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="text-gray-600 flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-gray-700 font-medium text-sm sm:text-base truncate">{item.label}</span>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

