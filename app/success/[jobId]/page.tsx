'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Phone } from 'lucide-react';

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/jobs/${jobId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'ACCEPTED' || data.status === 'EN_ROUTE') {
            router.push(`/job/${jobId}`);
          }
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [jobId, router]);

  return (
    <main className="min-h-screen bg-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
          <h1 className="text-4xl font-bold text-green-900">Payment Received!</h1>
          <p className="text-2xl text-green-700">Dispatching now...</p>
        </div>

        <Card className="border-2 border-green-200 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-center space-x-2 text-lg text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Finding the nearest available Tasker...</span>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-14 text-lg"
                onClick={() => router.push(`/job/${jobId}`)}
              >
                View Job Details
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-14 text-lg"
                onClick={() => router.push('/support')}
              >
                <Phone className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
