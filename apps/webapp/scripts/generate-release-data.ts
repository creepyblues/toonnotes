import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

interface GitCommit {
  hash: string;
  message: string;
  date: string;
  author: string;
}

interface ReleaseData {
  commits: GitCommit[];
  generatedAt: string;
  totalCount: number;
}

const MAX_COMMITS = 50;

function generateReleaseData() {
  const scriptDir = dirname(new URL(import.meta.url).pathname);
  const monorepoRoot = join(scriptDir, '../../..');
  const outputDir = join(scriptDir, '../data');
  const outputPath = join(outputDir, 'release-data.json');

  // Ensure data directory exists
  mkdirSync(outputDir, { recursive: true });

  // Get commits from git log
  // Format: hash|||subject|||date|||author
  const gitLog = execSync(
    `git log --format='%h|||%s|||%aI|||%an' -${MAX_COMMITS}`,
    { encoding: 'utf-8', cwd: monorepoRoot }
  );

  const commits: GitCommit[] = gitLog
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      // Remove surrounding quotes if present
      const cleanLine = line.replace(/^'|'$/g, '');
      const [hash, message, date, author] = cleanLine.split('|||');
      return { hash, message, date, author };
    });

  const releaseData: ReleaseData = {
    commits,
    generatedAt: new Date().toISOString(),
    totalCount: commits.length,
  };

  writeFileSync(outputPath, JSON.stringify(releaseData, null, 2));

  console.log(`Generated release data with ${commits.length} commits at ${outputPath}`);
}

generateReleaseData();
