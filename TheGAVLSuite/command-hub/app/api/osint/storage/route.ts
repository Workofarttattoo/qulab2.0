import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";
import { z } from "zod";

const storageRequestSchema = z.object({
  action: z.enum(['create_case', 'get_cases', 'get_evidence', 'search_evidence']),
  case_id: z.string().optional(),
  case_name: z.string().optional(),
  case_description: z.string().optional(),
  filters: z.any().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('osint-storage-request', async (span) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        trackApiRequest('POST', '/api/osint/storage', Date.now() - startTime, 401);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const validatedData = storageRequestSchema.parse(body);

      span.setAttributes({
        'user.id': session.user.id,
        'osint.action': validatedData.action,
      });

      // In a real implementation, this would call the Python OSINT storage module
      // For now, we'll return mock data
      let result;

      switch (validatedData.action) {
        case 'create_case':
          result = {
            case_id: `case_${Date.now()}`,
            name: validatedData.case_name,
            description: validatedData.case_description,
            status: 'active',
            created_at: new Date().toISOString()
          };
          break;

        case 'get_cases':
          result = {
            cases: [
              {
                id: 'case_1',
                name: 'Investigation Alpha',
                description: 'Initial investigation case',
                status: 'active',
                created_at: '2024-01-01T00:00:00Z',
                evidence_count: 15
              },
              {
                id: 'case_2',
                name: 'Investigation Beta',
                description: 'Follow-up investigation',
                status: 'closed',
                created_at: '2024-01-15T00:00:00Z',
                evidence_count: 8
              }
            ]
          };
          break;

        case 'get_evidence':
          result = {
            evidence: [
              {
                id: 'ev_1',
                evidence_type: 'breach_check',
                target: 'example@email.com',
                source: 'haveibeenpwned',
                classification: 'sensitive',
                confidence: 0.95,
                verified: true,
                created_at: '2024-01-01T10:00:00Z',
                tags: ['breach', 'email']
              },
              {
                id: 'ev_2',
                evidence_type: 'social_profile',
                target: 'john.doe',
                source: 'linkedin',
                classification: 'public',
                confidence: 0.85,
                verified: false,
                created_at: '2024-01-01T11:00:00Z',
                tags: ['social', 'professional']
              }
            ],
            total_count: 2
          };
          break;

        case 'search_evidence':
          result = {
            evidence: [],
            total_count: 0,
            filters_applied: validatedData.filters || {}
          };
          break;

        default:
          throw new Error(`Unknown action: ${validatedData.action}`);
      }

      trackApiRequest('POST', '/api/osint/storage', Date.now() - startTime, 200);

      return NextResponse.json(result);

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/osint/storage',
        method: 'POST'
      });

      trackApiRequest('POST', '/api/osint/storage', Date.now() - startTime, 500);

      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Invalid request data',
          details: error.errors
        }, { status: 400 });
      }

      return NextResponse.json({
        error: 'Internal server error'
      }, { status: 500 });
    }
  });
}
