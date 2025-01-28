import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import type {
  TextItem,
  TextMarkedContent,
} from 'pdfjs-dist/types/src/display/api';

// Needed for pdf.js to work in Node environment
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  'pdfjs-dist/legacy/build/pdf.worker.js',
);

interface Building {
  has_number: string;
  has_address: string | null;
}

interface CoResponse {
  bin_num: string;
  coa_records: {
    coa_number: string;
    coa_file_link: string;
    coa_file_contents?: string;
  }[];
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

async function extractPdfText(url: string): Promise<string | undefined> {
  try {
    const doc = await pdfjsLib.getDocument({
      url,
      disableFontFace: true,
      cMapUrl: 'node_modules/pdfjs-dist/cmaps/',
      cMapPacked: true,
    }).promise;

    const pages = Array.from({ length: doc.numPages }, (_, i) => i + 1);
    const texts = await Promise.all(
      pages.map(async (pageNum) => {
        try {
          const page = await doc.getPage(pageNum);
          const content = await page.getTextContent();
          return content.items
            .map((item: TextItem | TextMarkedContent) =>
              'str' in item ? item.str : (item as unknown as TextItem).str,
            )
            .join(' ');
        } catch (error) {
          console.error(`Error extracting text from page ${pageNum}:`, error);
          return '';
        }
      }),
    );

    const text = texts.join('\n').trim();
    return text || '[PDF text extraction failed]';
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '[PDF text extraction failed]';
  }
}

async function main() {
  const baseDir = 'apps/web/src/data/buildings';
  const buildingsPath = path.join(baseDir, 'buildings.json');

  const buildings = await readJsonFile<Building[]>(buildingsPath);
  if (!buildings) {
    console.error('Could not read buildings.json');
    return;
  }

  let totalProcessed = 0;
  let totalFailed = 0;

  for (const building of buildings) {
    const binNumber = building.has_number;
    if (!binNumber || !building.has_address) continue;

    const buildingDir = path.join(baseDir, binNumber);
    const coPath = path.join(buildingDir, 'co.json');
    const coData = await readJsonFile<CoResponse>(coPath);

    if (!coData?.coa_records) continue;

    const unprocessedRecords = coData.coa_records.filter(
      (r) =>
        !r.coa_file_contents ||
        r.coa_file_contents === '[PDF text extraction failed]',
    );

    if (unprocessedRecords.length === 0) {
      console.log(`Building ${binNumber}: All COs already processed`);
      continue;
    }

    console.log(
      `\nProcessing building ${binNumber}: ${unprocessedRecords.length} COs remaining`,
    );

    let processedCount = 0;
    let failedCount = 0;

    for (const record of coData.coa_records) {
      if (
        !record.coa_file_contents ||
        record.coa_file_contents === '[PDF text extraction failed]'
      ) {
        console.log(
          `  Extracting CO PDF (${++processedCount}/${unprocessedRecords.length}): ${record.coa_number}`,
        );
        const pdfText = await extractPdfText(record.coa_file_link);
        record.coa_file_contents = pdfText;

        if (pdfText === '[PDF text extraction failed]') {
          failedCount++;
          totalFailed++;
        }

        await writeFile(coPath, JSON.stringify(coData, null, 2));
      }
    }

    totalProcessed += processedCount;
    console.log(
      `Completed building ${binNumber} (Failed: ${failedCount}/${processedCount})`,
    );
  }

  console.log('\nFinished processing all buildings:');
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Total failed: ${totalFailed}`);
}

main().catch(console.error);
