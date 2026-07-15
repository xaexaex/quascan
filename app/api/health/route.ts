import { NextResponse } from 'next/server';
import { fetchHealth } from '@/lib/api';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'disconnected';
  try {
    await dbConnect();
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
    }
  } catch (e) {
    dbStatus = 'error';
  }

  let nodeStatus = 'offline';
  try {
    const health = await fetchHealth();
    if (health?.status === 'ok') {
      nodeStatus = 'online';
    }
  } catch (e) {
    nodeStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected' && nodeStatus === 'online';

  return NextResponse.json({
    status: isHealthy ? 'ok' : 'degraded',
    components: {
      database: dbStatus,
      node: nodeStatus
    },
    timestamp: new Date().toISOString()
  }, {
    status: isHealthy ? 200 : 503
  });
}
