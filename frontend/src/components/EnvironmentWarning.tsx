'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { healthService } from '@/services/healthService';
import { HealthData } from '@/types/health';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EnvironmentWarning() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthData = await healthService.getHealth();
        if (healthData) {
          setHealth(healthData);
          // Show warning if there are missing configurations
          if (healthData.externalApis && healthData.externalApis.missing.length > 0) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to check environment status:', error);
      }
    };

    checkHealth();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible || isDismissed || !health?.externalApis || health.externalApis.missing.length === 0) {
    return null;
  }

  const { missing, summary } = health.externalApis;
  // Since all are now required, always show as required missing
  const hasRequiredMissing = summary.missing > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <Card className={`border-2 w-full max-w-2xl flex flex-col h-[75vh] ${hasRequiredMissing ? 'border-orange-500 bg-orange-50' : 'border-yellow-500 bg-yellow-50'} animate-in zoom-in-95 duration-300`}>
        <CardHeader className="pb-3 flex-shrink-0 border-b border-orange-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className={`h-5 w-5 ${hasRequiredMissing ? 'text-orange-600' : 'text-yellow-600'} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <CardTitle className={`text-base ${hasRequiredMissing ? 'text-orange-900' : 'text-yellow-900'}`}>
                  Incomplete System Configuration
                </CardTitle>
                <p className={`text-sm mt-1 ${hasRequiredMissing ? 'text-orange-800' : 'text-yellow-800'}`}>
                  System will not function completely due to missing required configuration settings
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 flex-shrink-0 hover:bg-gray-200 rounded-full"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-3">
            {missing.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border bg-white border-orange-200"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-orange-900">
                      {item.service}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Missing variables: <span className="font-mono font-medium">{item.missingVariables.join(', ')}</span>
                    </p>
                    {item.affectedFeatures && item.affectedFeatures.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-orange-100">
                        <p className="text-xs font-medium text-orange-800 mb-1">
                          Features that will not work:
                        </p>
                        <ul className="text-xs text-gray-700 space-y-0.5">
                          {item.affectedFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-orange-600 mt-0.5">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-4 p-3 rounded-lg ${
            hasRequiredMissing ? 'bg-orange-100 border border-orange-200' : 'bg-yellow-100 border border-yellow-200'
          }`}>
            <p className={`text-xs ${hasRequiredMissing ? 'text-orange-900' : 'text-yellow-900'}`}>
              <strong>How to fix:</strong> This issue will be resolved when you configure the missing environment variables in{' '}
              <code className="bg-white px-1.5 py-0.5 rounded text-xs font-mono">backend/.env</code>{ ' '}
              and restart the backend server (see details in{' '}
              <a 
                href="https://github.com/tikpoptv/MUSE-MUSIC/blob/main/README.md#-environment-variables" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-medium hover:text-orange-700"
              >
                README.md
              </a>)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
