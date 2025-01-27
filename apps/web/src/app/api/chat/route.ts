import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side env variable
  maxRetries: Number(process.env.OPENAI_MAX_RETRIES) || 3,
});

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an assistant that analyzes Certificate of Occupancy (CO) documents for NYC buildings.
          Identify possible issues related to the building based on the COs, such as outstanding requirements, zoning violations, or occupancy classifications.
          Provide details on occupancy classifications, zoning details, building specifications, and historical changes.`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      model: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: Number(process.env.OPENAI_TEMPERATURE) || 0.3,
      max_tokens: Number(process.env.OPENAI_MAX_TOKENS) || 4096,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 },
      );
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 },
    );
  }
}
