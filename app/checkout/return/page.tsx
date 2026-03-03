'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CheckoutReturn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/stripe/verify?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.jobId) {
            router.push(`/success/${data.jobId}`);
          }
        });
    }
  }, [sessionId, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      <p className="text-xl text-gray-600">Confirming your payment...</p>
    </div>
  );
}
