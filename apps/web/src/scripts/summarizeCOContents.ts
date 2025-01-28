import { promises as fs } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Building {
  has_number: string;
  co_count: number;
}

interface CORecord {
  coa_number: string;
  coa_file_link: string;
  coa_file_contents?: string;
  coa_file_summary?: string;
}

interface COData {
  bin_num: string;
  coa_records: CORecord[];
}

async function summarizeContent(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at analyzing NYC Certificate of Occupancy documents. Summarize the key information from the document in a concise way, focusing on occupancy classifications, building specifications, and important restrictions or conditions.',
        },
        {
          role: 'user',
          content: `Summarize the following CO document content concisely:\n\n${content}`,
        },
      ],
      model: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: 0.3,
      max_tokens: 250,
    });

    return (
      completion.choices[0]?.message?.content || 'Summary generation failed'
    );
  } catch (error) {
    console.error('Error summarizing content:', error);
    return 'Summary generation failed';
  }
}

async function processBuildings() {
  try {
    // Read buildings data
    const buildingsPath = path.join(
      process.cwd(),
      'src/data/buildings/buildings.json',
    );
    const buildingsData = JSON.parse(
      await fs.readFile(buildingsPath, 'utf8'),
    ) as Building[];

    // Process each building
    for (const building of buildingsData) {
      if (building.co_count === 0) continue;

      const binNumber = building.has_number;
      console.log(`Processing building ${binNumber}...`);

      // Read CO data for the building
      const coPath = path.join(
        process.cwd(),
        `src/data/buildings/${binNumber}/co.json`,
      );
      const coData = JSON.parse(await fs.readFile(coPath, 'utf8')) as COData;

      let hasUpdates = false;

      // Process each CO record
      for (const record of coData.coa_records) {
        if (
          record.coa_file_contents &&
          record.coa_file_contents !== '[PDF text extraction failed]' &&
          !record.coa_file_summary
        ) {
          console.log(`Summarizing CO ${record.coa_number}...`);

          // Add delay to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));

          record.coa_file_summary = await summarizeContent(
            record.coa_file_contents,
          );
          hasUpdates = true;
        }
      }

      // Save updated CO data if there were any changes
      if (hasUpdates) {
        await fs.writeFile(coPath, JSON.stringify(coData, null, 2));
        console.log(`Updated summaries saved for building ${binNumber}`);
      }
    }

    console.log('Processing complete!');
  } catch (error) {
    console.error('Error processing buildings:', error);
  }
}

// Run the script
processBuildings().catch(console.error);
