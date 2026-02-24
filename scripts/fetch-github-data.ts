import fs from 'fs';
import path from 'path';

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface GitHubGraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: ContributionCalendar;
      };
    };
  };
  errors?: { message: string }[];
}

// Define expected output directory relative to project root
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'github-contributions.json');

// Get GitHub username from environment, fallback to what's in the spec
const GH_USERNAME = process.env.GH_USERNAME || 'wenshengchen';
const GH_TOKEN = process.env.GH_TOKEN;

async function fetchGitHubData() {
  if (!GH_TOKEN) {
    console.warn('⚠️ GH_TOKEN is not set in environment. Skipping GitHub data fetch.');
    console.warn('Creating a mock github-contributions.json file instead.');
    createMockData();
    return;
  }

  console.log(`Fetching GitHub contribution data for @${GH_USERNAME}...`);

  const query = `
    query {
      user(login: "${GH_USERNAME}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${GH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }

    const result = await response.json() as GitHubGraphQLResponse;

    if (result.errors) {
      throw new Error(result.errors.map((e) => e.message).join('\n'));
    }

    const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
    
    if (!calendar) {
      throw new Error('Unexpected response format from GitHub API');
    }

    // Ensure public directory exists
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    // Write to public folder
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(calendar, null, 2));
    
    console.log(`✅ Successfully saved GitHub data to ${OUTPUT_FILE}`);
    console.log(`Total contributions this year: ${calendar.totalContributions}`);
    
  } catch (error) {
    console.error('❌ Failed to fetch GitHub data:', error);
    console.warn('Falling back to mock data to prevent build failure.');
    createMockData();
  }
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function createMockData() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const rand = seededRandom(42);
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);

  const mockWeeks: ContributionWeek[] = [];
  const cursor = new Date(startDate);

  for (let w = 0; w < 52; w++) {
    const days: ContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      days.push({
        contributionCount: rand() > 0.6 ? Math.floor(rand() * 10) : 0,
        date: cursor.toISOString().split('T')[0],
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    mockWeeks.push({ contributionDays: days });
  }

  const mockData: ContributionCalendar = {
    totalContributions: mockWeeks.reduce((acc, week) =>
      acc + week.contributionDays.reduce((dayAcc, day) => dayAcc + day.contributionCount, 0)
    , 0),
    weeks: mockWeeks,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mockData, null, 2));
  console.log(`✅ Created mock GitHub data at ${OUTPUT_FILE}`);
}

fetchGitHubData();