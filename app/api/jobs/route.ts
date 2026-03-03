import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const job = await prisma.job.create({
      data: {
        ...body,
        lat: 40.7128,
        lng: -74.0060,
        status: 'DRAFT',
        durationSecondsPurchased: body.serviceType === 'MINUTES_60' ? 3600 : 1800,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (id) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: { tasker: true },
    });
    return NextResponse.json(job);
  }
  
  const jobs = await prisma.job.findMany();
  return NextResponse.json(jobs);
}
