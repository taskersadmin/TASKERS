import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const ticket = await prisma.supportTicket.create({
      data: {
        creatorType: 'customer',
        category: body.category,
        description: body.description,
        creatorId: body.phone,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
