import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface Building {
  has_address: string | null;
  has_city: string;
  has_number: string;
  co_count?: number;
  violation_count?: number;
}

interface CoData {
  bin: string;
  certificate_number: string;
  issue_date: string;
}

interface ViolationData {
  bin: string;
  violation_number: string;
  issue_date: string;
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

async function main() {
  const baseDir = 'apps/web/src/data/buildings';
  const buildingsPath = path.join(baseDir, 'buildings.json');

  // Read buildings.json
  const buildings = await readJsonFile<Building[]>(buildingsPath);
  if (!buildings) {
    console.error('Could not read buildings.json');
    return;
  }

  // Update each building with counts
  const updatedBuildings = await Promise.all(
    buildings.map(async (building) => {
      const binNumber = building.has_number;
      if (!binNumber) return building;

      const buildingDir = path.join(baseDir, binNumber);

      // Read CO data
      const coData = await readJsonFile<CoData[]>(
        path.join(buildingDir, 'co.json'),
      );
      const coCount = coData?.length ?? 0;

      // Read violations data
      const violationsData = await readJsonFile<ViolationData[]>(
        path.join(buildingDir, 'violations.json'),
      );
      const violationCount = violationsData?.length ?? 0;

      return {
        ...building,
        co_count: coCount,
        violation_count: violationCount,
      };
    }),
  );

  // Write updated data back to buildings.json
  await writeFile(buildingsPath, JSON.stringify(updatedBuildings, null, 2));

  console.log('Successfully updated building counts');
}

main().catch(console.error);
