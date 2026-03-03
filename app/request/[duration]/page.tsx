'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function RequestPage({ params }: { params: { duration: string } }) {
  const router = useRouter();
  const duration = params.duration;
  const isAddTime = duration === 'add-time';
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    description: '',
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const serviceType = duration === '30' ? 'MINUTES_30' : 
                       duration === '60' ? 'MINUTES_60' : 'ADD_TIME_30';
    
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        serviceType,
      }),
    });
    
    const data = await res.json();
    setLoading(false);
    
    if (data.id) {
      router.push(`/review/${data.id}`);
    }
  };

  const isValid = formData.name && formData.phone && (isAddTime || (formData.address && formData.description));

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-3xl text-center">
              {isAddTime ? 'Add Time to Current Task' : 'Tell Us About Your Task'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg">Your Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-14 text-lg touch-target"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-lg">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-14 text-lg touch-target"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              {!isAddTime && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-14 text-lg touch-target"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-lg">Service Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="h-14 text-lg touch-target"
                      placeholder="123 Main St, City, State ZIP"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-lg">What do you need help with? *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[120px] text-lg"
                      placeholder="Describe your task in detail..."
                      required
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={!isValid || loading}
                className="w-full h-16 text-xl font-semibold touch-target"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue to Review'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
