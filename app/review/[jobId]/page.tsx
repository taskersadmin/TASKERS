'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then(res => res.json())
      .then(data => {
        setJob(data);
        setLoading(false);
      });
  }, [jobId]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) return null;

  const price = job.serviceType === 'MINUTES_30' ? 75 : 
                job.serviceType === 'MINUTES_60' ? 125 : 50;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-3xl text-center">Review Your Request</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <ReviewItem label="Service" value={job.serviceType === 'MINUTES_30' ? '30 Minutes - $75' : job.serviceType === 'MINUTES_60' ? '1 Hour - $125' : 'Add 30 Minutes - $50'} />
              <ReviewItem label="Name" value={job.customerName} />
              <ReviewItem label="Phone" value={job.customerPhone} />
              {job.customerEmail && <ReviewItem label="Email" value={job.customerEmail} />}
              {job.address && <ReviewItem label="Address" value={job.address} />}
              {job.description && <ReviewItem label="Description" value={job.description} />}
            </div>

            <div className="border-t-2 pt-6">
              <div className="flex justify-between items-center text-2xl font-bold mb-6">
                <span>Total</span>
                <span>${price}.00</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full h-16 text-xl font-semibold touch-target bg-green-600 hover:bg-green-700"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay Now & Dispatch Tasker'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
