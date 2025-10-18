import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('admin-metrics-request', async (span) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user || session.user.role !== 'admin') {
        trackApiRequest('GET', '/api/admin/metrics', Date.now() - startTime, 403);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Get job metrics
      const [
        totalJobs,
        activeJobs,
        completedJobs,
        failedJobs,
        averageDuration,
        totalUsers,
        activeUsers
      ] = await Promise.all([
        prisma.job.count(),
        prisma.job.count({ where: { status: 'running' } }),
        prisma.job.count({ where: { status: 'completed' } }),
        prisma.job.count({ where: { status: 'failed' } }),
        prisma.job.aggregate({
          where: { 
            status: 'completed',
            completedAt: { not: null }
          },
          _avg: {
            // This would need a duration field in the schema
            // For now, we'll calculate it from timestamps
          }
        }),
        prisma.user.count(),
        prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        })
      ]);

      // Calculate average job duration (simplified)
      const completedJobsWithDuration = await prisma.job.findMany({
        where: { 
          status: 'completed',
          completedAt: { not: null }
        },
        select: {
          createdAt: true,
          completedAt: true
        }
      });

      const averageJobDuration = completedJobsWithDuration.length > 0
        ? completedJobsWithDuration.reduce((sum, job) => {
            const duration = job.completedAt!.getTime() - job.createdAt.getTime();
            return sum + duration / 1000; // Convert to seconds
          }, 0) / completedJobsWithDuration.length
        : 0;

      // Calculate error rate
      const errorRate = totalJobs > 0 ? failedJobs / totalJobs : 0;

      // Mock API request count (in real implementation, this would come from metrics store)
      const apiRequests = totalJobs * 2; // Rough estimate

      const metrics = {
        totalJobs,
        activeJobs,
        completedJobs,
        failedJobs,
        averageJobDuration,
        apiRequests,
        errorRate,
        activeUsers,
        totalUsers
      };

      span.setAttributes({
        'metrics.total_jobs': totalJobs,
        'metrics.active_jobs': activeJobs,
        'metrics.error_rate': errorRate,
      });

      trackApiRequest('GET', '/api/admin/metrics', Date.now() - startTime, 200);

      return NextResponse.json(metrics);

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/admin/metrics',
        method: 'GET'
      });

      trackApiRequest('GET', '/api/admin/metrics', Date.now() - startTime, 500);

      return NextResponse.json({
        error: 'Internal server error'
      }, { status: 500 });
    }
  });
}
