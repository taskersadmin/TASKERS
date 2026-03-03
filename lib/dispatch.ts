import { prisma } from './prisma';

const DISPATCH_RADIUS_MILES = parseFloat(process.env.DISPATCH_RADIUS_MILES || '10');
const MAX_CONCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS_PER_TASKER || '1');
const OFFER_TTL_SECONDS = parseInt(process.env.DISPATCH_OFFER_TTL_SECONDS || '90');

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function findEligibleTaskers(jobLat: number, jobLng: number, excludeTaskerIds: string[] = []) {
  const availableTaskers = await prisma.taskerProfile.findMany({
    where: {
      verified: true,
      active: true,
      available: true,
      id: { notIn: excludeTaskerIds },
      lat: { not: null },
      lng: { not: null },
    },
    include: {
      jobs: {
        where: {
          status: {
            in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'PIN_VERIFIED', 'BEFORE_PHOTO', 'IN_PROGRESS', 'ADD_TIME_PENDING'],
          },
        },
      },
    },
  });

  const eligibleTaskers = availableTaskers.filter(tasker => {
    if (tasker.jobs.length >= MAX_CONCURRENT_JOBS) return false;
    if (tasker.lat && tasker.lng) {
      const distance = calculateDistance(jobLat, jobLng, tasker.lat, tasker.lng);
      return distance <= DISPATCH_RADIUS_MILES;
    }
    return false;
  });

  return eligibleTaskers
    .map(tasker => ({
      ...tasker,
      distance: calculateDistance(jobLat, jobLng, tasker.lat!, tasker.lng!),
    }))
    .sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return (b.lastActiveAt?.getTime() || 0) - (a.lastActiveAt?.getTime() || 0);
    });
}

export async function createDispatchOffer(jobId: string, taskerId: string, distance: number) {
  const expiresAt = new Date(Date.now() + OFFER_TTL_SECONDS * 1000);
  
  return prisma.dispatchOffer.create({
    data: {
      jobId,
      taskerId,
      offerExpiresAt: expiresAt,
      distanceMiles: distance,
    },
  });
}
