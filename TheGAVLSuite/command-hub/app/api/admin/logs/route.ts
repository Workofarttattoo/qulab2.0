import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('admin-logs-request', async (span) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user || session.user.role !== 'admin') {
        trackApiRequest('GET', '/api/admin/logs', Date.now() - startTime, 403);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // In a real implementation, this would fetch from a log aggregation service
      // For now, we'll return mock logs
      const mockLogs = [
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          level: 'info',
          message: 'Job completed successfully',
          module: 'osint',
          jobId: 'job_123',
          userId: 'user_456'
        },
        {
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          level: 'error',
          message: 'Python subprocess failed with exit code 1',
          module: 'hellfire',
          jobId: 'job_124',
          userId: 'user_456'
        },
        {
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          level: 'warn',
          message: 'Rate limit exceeded for user',
          module: 'legal',
          userId: 'user_789'
        },
        {
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          level: 'info',
          message: 'New user registered',
          module: 'auth',
          userId: 'user_999'
        },
        {
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          level: 'debug',
          message: 'WebSocket connection established',
          module: 'socket',
          userId: 'user_456'
        }
      ];

      span.setAttributes({
        'logs.count': mockLogs.length,
      });

      trackApiRequest('GET', '/api/admin/logs', Date.now() - startTime, 200);

      return NextResponse.json({ logs: mockLogs });

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/admin/logs',
        method: 'GET'
      });

      trackApiRequest('GET', '/api/admin/logs', Date.now() - startTime, 500);

      return NextResponse.json({
        error: 'Internal server error'
      }, { status: 500 });
    }
  });
}
