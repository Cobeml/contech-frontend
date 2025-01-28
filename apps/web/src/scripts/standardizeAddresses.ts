import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface Building {
  has_number: string;
  has_address: string | null;
  has_city: string;
  co_count: number;
  violation_count: number;
}

async function standardizeAddresses() {
  const buildingsPath = path.join('apps/web/src/data/buildings/buildings.json');

  try {
    const content = await readFile(buildingsPath, 'utf-8');
    const buildings = JSON.parse(content) as Building[];

    const updatedBuildings = buildings.map((building) => {
      if (!building.has_address) return building;

      // Take first address if comma-separated
      const primaryAddress =
        building.has_address.split(',')[0]?.trim() ||
        building.has_address.trim();

      // Standardize the address format
      const standardizedAddress = `${primaryAddress}, ${building.has_city}, NY`;

      return {
        ...building,
        has_address: standardizedAddress,
      };
    });

    await writeFile(buildingsPath, JSON.stringify(updatedBuildings, null, 2));

    console.log('Successfully standardized addresses');
  } catch (error) {
    console.error('Error processing buildings:', error);
  }
}

standardizeAddresses().catch(console.error);
