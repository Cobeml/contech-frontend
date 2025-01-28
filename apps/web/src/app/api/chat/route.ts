import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const envSchema = z.object({
  PINECONE_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
});

try {
  envSchema.parse(process.env);
} catch (error) {
  console.error('Environment validation failed:', error);
  throw new Error('Missing required environment variables');
}

if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
  throw new Error('Missing required environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: Number(process.env.OPENAI_MAX_RETRIES) || 3,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 },
      );
    }

    const { query, buildingNumber } = await request.json();

    if (!query || !buildingNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      );
    }

    // Create embedding for the query
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const [queryEmbedding] = await embeddings.embedDocuments([query]);

    // Use building-specific index
    const index = pinecone.Index(`building-${buildingNumber}-cos`);
    const queryResponse = await index.query({
      vector: queryEmbedding as number[],
      topK: 5,
      includeMetadata: true,
    });

    // Format relevant documents for context
    const context = queryResponse.matches
      .map(
        (match) => `Building: ${match.metadata?.building_address ?? 'Unknown'}
CO Number: ${match.metadata?.co_number ?? 'Unknown'}
Content: ${match.metadata?.content ?? 'No content'}
---`,
      )
      .join('\n');

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an assistant that analyzes Certificate of Occupancy (CO) documents for NYC buildings.
          Use the following CO documents as context for answering the question:
          
          ${context}
          
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
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 },
    );
  }
}
