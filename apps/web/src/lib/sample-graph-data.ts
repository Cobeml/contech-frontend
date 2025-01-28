import buildings from '@/data/buildings/buildings.json';
import type { Edge, Node } from 'reactflow';

import coData1016278 from '@/data/buildings/1016278/co.json';
import coData1036156 from '@/data/buildings/1036156/co.json';
import coData1082908 from '@/data/buildings/1082908/co.json';
import coData1088864 from '@/data/buildings/1088864/co.json';
// Import the CO data directly
import coData1089806 from '@/data/buildings/1089806/co.json';

// Map of building numbers to their CO data
const buildingCOData: Record<string, { coa_records: CORecord[] }> = {
  '1089806': coData1089806,
  '1082908': coData1082908,
  '1088864': coData1088864,
  '1016278': coData1016278,
  '1036156': coData1036156,
};

interface BuildingData {
  has_number: string;
  has_address: string;
  co_count: number;
}

interface CORecord {
  coa_number: string;
  coa_file_link: string;
  coa_file_contents: string;
  coa_file_summary?: string;
}

interface NodeData {
  label: string;
  details: string;
  category: string;
  expandable: boolean;
  link?: string;
  summary?: string;
}

function generateCircularPosition(
  index: number,
  total: number,
  radius: number,
) {
  const angle = (2 * Math.PI * index) / total;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

function calculateRadius(coCount: number): number {
  const baseRadius = 300;
  const scaleFactor = Math.sqrt(coCount / 10);
  return baseRadius * scaleFactor;
}

export function generateGraphData(buildingNumber: string): {
  nodes: Node[];
  edges: Edge[];
} {
  const buildingData = buildings.find((b) => b.has_number === buildingNumber);
  const coRecords = buildingCOData[buildingNumber]?.coa_records || [];

  // Add logging to debug
  console.log(`Building ${buildingNumber} has ${coRecords.length} CO records`);
  console.log(
    'CO Numbers:',
    coRecords.map((r) => r.coa_number),
  );

  if (!buildingData) {
    console.error(`Building ${buildingNumber} not found`);
    return { nodes: [], edges: [] };
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: `building-${buildingNumber}`,
    type: 'concept',
    data: {
      label: `Building BIN: ${buildingNumber}`,
      details: buildingData.has_address,
      category: 'concept',
      expandable: true,
    },
    position: { x: 0, y: 0 },
  });

  const radius = calculateRadius(coRecords.length || buildingData.co_count);

  // Use actual CO records if available, otherwise fall back to count
  const recordsToUse =
    coRecords.length > 0 ? coRecords : Array(buildingData.co_count).fill(null);

  recordsToUse.forEach((record, i) => {
    const position = generateCircularPosition(i, recordsToUse.length, radius);

    const coNodeId = `co-${buildingNumber}-${record?.coa_number || i}-${i}`;
    nodes.push({
      id: coNodeId,
      type: 'regulation',
      data: {
        label: record?.coa_number || `Certificate of Occupancy ${i + 1}`,
        details: 'Building Certificate of Occupancy Document',
        category: 'regulation',
        expandable: true,
        link: record?.coa_file_link,
        summary: record?.coa_file_summary || null,
      },
      position,
    });

    edges.push({
      id: `e-building-${buildingNumber}-${record?.coa_number || i}-${i}`,
      source: `building-${buildingNumber}`,
      target: coNodeId,
      label: 'has document',
      type: 'dependency',
    });
  });

  return { nodes, edges };
}

export const initialNodes = generateGraphData('1089806').nodes;
export const initialEdges = generateGraphData('1089806').edges;
