import { mkdir, writeFile } from 'node:fs/promises';
import buildings from '../data/buildings/buildings.json';

async function fetchData(url: string, binNumber: string) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bin_number: binNumber }),
    });

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data for BIN ${binNumber}:`, error);
    return null;
  }
}

async function main() {
  const baseDir = 'apps/web/src/data/buildings';

  for (const building of buildings) {
    const binNumber = building.has_number;
    if (!binNumber) continue;

    // Create directory for building
    const buildingDir = `${baseDir}/${binNumber}`;
    await mkdir(buildingDir, { recursive: true });

    // Fetch COs
    const coData = await fetchData(
      'https://ajay-bhargava--contech-ims-v2.modal.run/coa_by_bin',
      binNumber,
    );

    // Fetch Violations
    const violationData = await fetchData(
      'https://ajay-bhargava--contech-ims-v2.modal.run/violation_by_bin',
      binNumber,
    );

    // Save CO data
    if (coData) {
      await writeFile(
        `${buildingDir}/co.json`,
        JSON.stringify(coData, null, 2),
      );
    }

    // Save Violation data
    if (violationData) {
      await writeFile(
        `${buildingDir}/violations.json`,
        JSON.stringify(violationData, null, 2),
      );
    }

    console.log(`Processed building ${binNumber}`);
  }
}

main().catch(console.error);
