import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { jobQueue } from "@/lib/job-queue";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('jobs-list-request', async (span) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        trackApiRequest('GET', '/api/jobs', Date.now() - startTime, 401);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      span.setAttributes({
        'user.id': session.user.id,
      });

      const jobs = await jobQueue.getUserJobs(session.user.id);

      trackApiRequest('GET', '/api/jobs', Date.now() - startTime, 200);

      return NextResponse.json({ jobs });

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/jobs',
        method: 'GET'
      });

      trackApiRequest('GET', '/api/jobs', Date.now() - startTime, 500);

      return NextResponse.json({
        error: 'Internal server error'
      }, { status: 500 });
    }
  });
}
