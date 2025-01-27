import type { DatabaseQuery, GraphQueryResult } from './types';

// Mock data for testing
const MOCK_QUERY_RESULTS: Record<string, GraphQueryResult> = {
  'concrete materials': {
    nodes: [
      {
        id: 'concrete-1',
        type: 'material',
        data: {
          label: 'Portland Cement',
          details: 'Commonly used cement type',
          category: 'Concrete',
          expandable: true,
        },
        position: { x: 0, y: 0 },
      },
      {
        id: 'reg-1',
        type: 'regulation',
        data: {
          label: 'ISO 19000',
          details: 'Sustainability standards',
          category: 'Sustainability',
          expandable: true,
        },
        position: { x: 100, y: 0 },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'concrete-1',
        target: 'reg-1',
        type: 'compliesWith',
      },
    ],
  },
};

export async function processNaturalLanguageQuery(
  query: string,
): Promise<GraphQueryResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock response based on query keywords
  for (const [keyword, result] of Object.entries(MOCK_QUERY_RESULTS)) {
    if (query.toLowerCase().includes(keyword)) {
      return result;
    }
  }

  // Default empty response
  return { nodes: [], edges: [] };
}

export async function translateToStructuredQuery(
  naturalLanguageQuery: string,
): Promise<DatabaseQuery> {
  // This would normally call the LLM API
  // Return mock structured query for now
  return {
    tables: ['materials', 'regulations'],
    conditions: {
      'materials.category': 'Concrete',
      'regulations.type': 'Sustainability',
    },
    relationships: ['material_regulation_compliance'],
  };
}
