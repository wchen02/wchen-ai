import fs from 'fs';
import path from 'path';

// Define expected output directory relative to project root
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'github-contributions.json');

// Get GitHub username from environment, fallback to what's in the spec
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'wenshengchen';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchGitHubData() {
  if (!GITHUB_TOKEN) {
    console.warn('⚠️ GITHUB_TOKEN is not set in environment. Skipping GitHub data fetch.');
    console.warn('Creating a mock github-contributions.json file instead.');
    createMockData();
    return;
  }

  console.log(`Fetching GitHub contribution data for @${GITHUB_USERNAME}...`);

  const query = `
    query {
      user(login: "${GITHUB_USERNAME}") {
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
        Authorization: `bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }

    const { data, errors } = await response.json() as { data: unknown; errors: { message: string }[] };

    if (errors) {
      throw new Error(errors.map((e) => e.message).join('\n'));
    }

    const calendar = (data as { user?: { contributionsCollection?: { contributionCalendar?: any } } })?.user?.contributionsCollection?.contributionCalendar;
    
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

function createMockData() {
  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Create some structured mock data that matches the schema
  const mockWeeks = Array.from({ length: 52 }, () => {
    return {
      contributionDays: Array.from({ length: 7 }, () => {
        // Randomly generate some contributions
        const count = Math.random() > 0.6 ? Math.floor(Math.random() * 10) : 0;
        return {
          contributionCount: count,
          date: `2026-01-01` // Just a placeholder string since we're mocking
        };
      })
    };
  });

  const mockData = {
    totalContributions: mockWeeks.reduce((acc, week) => 
      acc + week.contributionDays.reduce((dayAcc, day) => dayAcc + day.contributionCount, 0)
    , 0),
    weeks: mockWeeks
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mockData, null, 2));
  console.log(`✅ Created mock GitHub data at ${OUTPUT_FILE}`);
}

fetchGitHubData();