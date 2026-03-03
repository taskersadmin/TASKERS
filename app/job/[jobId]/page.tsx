'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Phone } from 'lucide-react';

export default function JobPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    const fetchJob = () => {
      fetch(`/api/jobs/${jobId}`)
        .then(res => res.json())
        .then(data => setJob(data));
    };

    fetchJob();
    const interval = setInterval(fetchJob, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const showPin = ['EN_ROUTE', 'ARRIVED', 'PIN_VERIFIED', 'BEFORE_PHOTO', 'IN_PROGRESS', 'ADD_TIME_PENDING'].includes(job.status);

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-blue-50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Job #{job.jobNumber}</CardTitle>
              <Badge className="text-lg">{job.status.replace(/_/g, ' ')}</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {job.tasker && (
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <h3 className="font-bold text-lg text-green-900">Your Tasker</h3>
                <p className="text-xl font-semibold">{job.tasker.name}</p>
                {job.status === 'EN_ROUTE' && (
                  <div className="flex items-center text-blue-700">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>On the way to you</span>
                  </div>
                )}
              </div>
            )}

            {showPin && (
              <div className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg text-center space-y-2">
                <p className="text-gray-700 font-medium">Your 4-Digit PIN</p>
                <p className="text-5xl font-bold text-yellow-800 tracking-widest">
                  {job.pin}
                </p>
                <p className="text-sm text-gray-600">
                  Share this with your Tasker when they arrive
                </p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <Button 
                variant="outline" 
                className="w-full h-14 text-lg"
                onClick={() => window.location.href = `tel:${job.tasker?.phone || 'support'}`}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call {job.tasker ? 'Tasker' : 'Support'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
