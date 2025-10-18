import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('signup-request', async (span) => {
    try {
      const body = await request.json();
      const validatedData = signUpSchema.parse(body);

      span.setAttributes({
        'user.email': validatedData.email,
        'user.name': validatedData.name,
      });

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (existingUser) {
        trackApiRequest('POST', '/api/auth/signup', Date.now() - startTime, 400);
        return NextResponse.json({
          error: 'User already exists with this email'
        }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: 'user',
          subscription: 'free',
        }
      });

      trackApiRequest('POST', '/api/auth/signup', Date.now() - startTime, 201);

      return NextResponse.json({
        message: 'User created successfully',
        userId: user.id
      }, { status: 201 });

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/auth/signup',
        method: 'POST'
      });

      trackApiRequest('POST', '/api/auth/signup', Date.now() - startTime, 500);

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
