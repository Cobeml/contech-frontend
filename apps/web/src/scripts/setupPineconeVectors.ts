import fs from 'node:fs/promises';
import path from 'node:path';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import type {
  Index,
  PineconeRecord,
  RecordMetadata,
} from '@pinecone-database/pinecone';
import { Document } from 'langchain/document';

interface Building {
  has_address: string | null;
  has_city: string;
  has_number: string;
  co_count: number;
  violation_count: number;
}

interface CORecord {
  coa_number: string;
  coa_file_link: string;
  coa_file_contents: string;
}

interface COData {
  bin_num: string;
  coa_records: CORecord[];
}

interface DocumentMetadata {
  building_number: string;
  building_address: string;
  co_number: string;
  source: string;
  content: string;
  [key: string]: string; // Add index signature
}

const PINECONE_INDEX_NAME = 'building-cos';
const CHUNK_SIZE = 1000; // Size of text chunks to split documents into

async function initPinecone() {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? '',
  });

  // Check if index exists, if not create it
  const existingIndexes = await pinecone.listIndexes();

  if (
    !existingIndexes.indexes?.find(
      (index) => index.name === PINECONE_INDEX_NAME,
    )
  ) {
    await pinecone.createIndex({
      name: PINECONE_INDEX_NAME,
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
      dimension: 1536,
      metric: 'cosine',
    });
    console.log('Created new Pinecone index');
  }

  return pinecone.Index(PINECONE_INDEX_NAME);
}

async function loadBuildings(): Promise<Building[]> {
  const buildingsPath = path.join(
    process.cwd(),
    'src/data/buildings/buildings.json',
  );
  const buildingsData = await fs.readFile(buildingsPath, 'utf-8');
  return JSON.parse(buildingsData);
}

async function loadCOData(buildingNumber: string): Promise<COData | null> {
  try {
    const coPath = path.join(
      process.cwd(),
      `src/data/buildings/${buildingNumber}/co.json`,
    );
    const coData = await fs.readFile(coPath, 'utf-8');
    return JSON.parse(coData);
  } catch (error) {
    console.error(
      `Error loading CO data for building ${buildingNumber}:`,
      error,
    );
    return null;
  }
}

async function createEmbeddings(documents: Document[]): Promise<number[][]> {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const texts = documents.map((doc) => doc.pageContent);
  return await embeddings.embedDocuments(texts);
}

async function initPineconeForBuilding(buildingNumber: string) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? '',
  });

  const indexName = `building-${buildingNumber}-cos`;

  // Check if index exists and delete it
  const existingIndexes = await pinecone.listIndexes();
  if (existingIndexes.indexes?.find((index) => index.name === indexName)) {
    console.log(`Deleting existing index for building ${buildingNumber}`);
    await pinecone.deleteIndex(indexName);
    // Wait a moment for the deletion to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Create new index
  await pinecone.createIndex({
    name: indexName,
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    },
    dimension: 1536,
    metric: 'cosine',
  });
  console.log(`Created new Pinecone index for building ${buildingNumber}`);

  return pinecone.Index(indexName);
}

async function deleteAllIndexes() {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? '',
  });

  const existingIndexes = await pinecone.listIndexes();
  console.log('Cleaning up existing indexes...');

  for (const index of existingIndexes.indexes ?? []) {
    console.log(`Deleting index: ${index.name}`);
    await pinecone.deleteIndex(index.name);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

async function verifyUpsert(
  index: Index,
  vectors: PineconeRecord[],
  retries = 5, // Increased retries
  delay = 10000, // Increased delay
) {
  const batchSize = 50; // Reduced batch size
  let successCount = 0;

  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    let attempt = 0;

    while (attempt < retries) {
      try {
        await index.upsert(batch);
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Verify each vector individually
        const verified = await Promise.all(
          batch.map(async (vector) => {
            const result = await index.fetch([vector.id]);
            return !!result.records?.[vector.id];
          }),
        );

        successCount += verified.filter(Boolean).length;
        console.log(
          `Batch ${i / batchSize + 1}: ${verified.filter(Boolean).length}/${batch.length} verified`,
        );

        if (verified.every(Boolean)) break;
      } catch (error) {
        console.error(
          `Batch ${i / batchSize + 1} attempt ${attempt + 1} failed:`,
          error,
        );
      }
      attempt++;
    }
  }

  console.log(
    `Successfully uploaded ${successCount}/${vectors.length} vectors`,
  );
  if (successCount !== vectors.length) {
    throw new Error(
      `Failed to upload ${vectors.length - successCount} vectors`,
    );
  }
}

function validateDocumentContent(content: string): boolean {
  if (!content) return false;

  const checks = [
    content.length > 10, // Reduced minimum length
    content.trim().length > 0, // Has non-whitespace content
    content !== '[PDF text extraction failed]', // Not a failed extraction
  ];

  return checks.every(Boolean);
}

async function main() {
  try {
    await deleteAllIndexes();

    const buildings = await loadBuildings();
    const buildingsWithAddress = buildings.filter((b) => b.has_address);
    console.log(
      `Found ${buildingsWithAddress.length} buildings with addresses`,
    );

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    for (const building of buildingsWithAddress) {
      console.log(
        `\nProcessing building ${building.has_number} (${building.has_address})`,
      );

      const coData = await loadCOData(building.has_number);
      if (!coData) {
        console.log(`No CO data found for building ${building.has_number}`);
        continue;
      }

      console.log(`Found ${coData.coa_records.length} total CO records`);

      const validRecords = coData.coa_records.filter((record) => {
        const content = record.coa_file_contents;
        // Only filter out explicit extraction failures
        return content !== '[PDF text extraction failed]';
      });
      console.log(`${validRecords.length} records have valid content`);

      // Add debug logging
      console.log('Content validation examples:');
      for (const record of validRecords.slice(0, 3)) {
        console.log(`\nCO ${record.coa_number}:`);
        console.log('Content length:', record.coa_file_contents.length);
        console.log('First 100 chars:', record.coa_file_contents.slice(0, 100));
        console.log(
          'Passes validation:',
          validateDocumentContent(record.coa_file_contents),
        );
      }

      // Initialize building-specific index
      const index = await initPineconeForBuilding(building.has_number);

      const documents = validRecords
        .filter((record) => validateDocumentContent(record.coa_file_contents))
        .map((record) => {
          try {
            return new Document<DocumentMetadata>({
              pageContent: record.coa_file_contents,
              metadata: {
                building_number: building.has_number,
                building_address: building.has_address ?? 'Unknown',
                co_number: record.coa_number,
                source: record.coa_file_link,
                content: record.coa_file_contents,
              },
            });
          } catch (error) {
            console.error(
              `Invalid document format in ${record.coa_number}:`,
              error,
            );
            return null;
          }
        })
        .filter((doc): doc is Document<DocumentMetadata> => doc !== null);

      if (documents.length === 0) {
        console.log(`No valid documents for building ${building.has_number}`);
        continue;
      }

      console.log(`Creating embeddings for ${documents.length} documents`);
      const vectors = await Promise.all(
        documents.map(async (doc) => {
          try {
            const [embedding] = await embeddings.embedDocuments([
              doc.pageContent,
            ]);
            if (!embedding || embedding.length !== 1536) {
              throw new Error('Invalid embedding generated');
            }
            return {
              id: `${building.has_number}-${doc.metadata.co_number}-${Date.now()}`,
              values: embedding as number[],
              metadata: doc.metadata,
            } as PineconeRecord<DocumentMetadata>;
          } catch (error) {
            console.error(
              `Failed to create embedding for ${doc.metadata.co_number}:`,
              error,
            );
            return null;
          }
        }),
      ).then((results) =>
        results.filter(
          (v): v is PineconeRecord<DocumentMetadata> => v !== null,
        ),
      );

      await verifyUpsert(index, vectors);

      const stats = await index.describeIndexStats();
      console.log(`Index stats for ${building.has_number}:`, {
        vectorCount: stats.totalRecordCount ?? 0,
        dimension: stats.dimension ?? 1536,
        namespaces: stats.namespaces ?? {},
      });

      console.log('Processing CO records:');
      coData.coa_records.forEach((record, idx) => {
        console.log(
          `${idx + 1}. ${record.coa_number}: ${
            record.coa_file_contents === '[PDF text extraction failed]'
              ? '❌ Extraction failed'
              : '✓ Valid content'
          }`,
        );
      });

      console.log(`Successfully uploaded ${vectors.length} vectors to index`);
    }

    console.log('Vector database setup complete');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
if (require.main === module) {
  main();
}
