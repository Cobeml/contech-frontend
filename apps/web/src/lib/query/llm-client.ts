'use client';

import type { DatabaseQuery, GraphQueryResult } from './types';

export async function processNaturalLanguageQuery(
  query: string,
): Promise<GraphQueryResult> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        format: `
          Use markdown formatting for clarity:
          - Use ## for section headers
          - Use **bold** for important information
          - Use *italics* for emphasis
          - Use \`code\` for specific values or references
          - Use > for important quotes or highlights
          - Use bullet points for lists
          - Use numbered lists for sequences
          - Use --- for separating sections
          - Use tables for structured data
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch response');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Return in GraphQueryResult format for compatibility
    return {
      nodes: [
        {
          id: 'response',
          type: 'concept',
          data: {
            label: 'AI Response',
            details: data.response,
            category: 'response',
            expandable: false,
          },
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
    };
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to process CO document query');
  }
}

export async function translateToStructuredQuery(
  naturalLanguageQuery: string,
): Promise<DatabaseQuery> {
  return {
    tables: ['buildings', 'certificates_of_occupancy'],
    conditions: {
      'buildings.bin': '1088864',
      'certificates_of_occupancy.type': 'CO',
    },
    relationships: ['building_co_documents'],
  };
}
