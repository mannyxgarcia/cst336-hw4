import express from 'express';
import fortune from 'fortune-cookie';
import { faker } from '@faker-js/faker';
import 'dotenv/config';
import retroWords from './data/retroWords.mjs';
import classicWebsites from './data/classicWebsites.mjs';
import { formatArchiveDate } from './utilities/dateUtilities.mjs';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

const COUNTER_API_URL =
  'https://api.counterapi.dev/v2/' +
  'manny-garcias-team-4792/' +
  'the-early-internet-visitor-counter';

async function incrementVisitorCount() {
  try {
    const response = await fetch(`${COUNTER_API_URL}/up`, {
      headers: {
        Authorization: `Bearer ${process.env.COUNTER_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`CounterAPI returned status ${response.status}`);
    }

    const data = await response.json();

    console.log('CounterAPI response:', data);

    return String(data.data.up_count).padStart(8, '0');
  } catch (error) {
    console.error('Visitor counter error:', error.message);
    return '00123456';
  }
}

const countedRoutes = new Set([
  '/',
  '/connection',
  '/websites',
  '/modern',
  '/slang',
  '/sources',
]);

app.use(async (req, res, next) => {
  console.log(req.path);

  if (countedRoutes.has(req.path)) {
    res.locals.visitorCount = await incrementVisitorCount();
  } else {
    res.locals.visitorCount = '00123456';
  }

  next();
});

function getFortune() {
  const randomIndex = Math.floor(Math.random() * fortune.length);
  return fortune[randomIndex];
}

function getScreenNames(amount = 4) {
  const screenNames = [];

  for (let i = 0; i < amount; i++) {
    const adjective = faker.word.adjective();
    const retroWord = faker.helpers.arrayElement(retroWords);
    const number = faker.number.int({ min: 10, max: 99 });

    const username =
      adjective.charAt(0).toUpperCase() +
      adjective.slice(1) +
      retroWord +
      number;

    screenNames.push(username);
  }

  return screenNames;
}

async function getArchivedWebsite(website) {
  const apiUrl =
    `https://archive.org/wayback/available` +
    `?url=${encodeURIComponent(website.url)}` +
    `&timestamp=${website.archiveDate}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Wayback API returned status ${response.status}`);
    }

    const data = await response.json();
    const snapshot = data.archived_snapshots?.closest;

    if (!snapshot?.available) {
      return {
        ...website,
        available: false,
        snapshotUrl: null,
        snapshotDate: null,
      };
    }

    return {
      ...website,
      available: true,
      snapshotUrl: snapshot.url,
      snapshotDate: snapshot.timestamp,
    };
  } catch (error) {
    console.error(`Could not retrieve ${website.name}:`, error.message);

    return {
      ...website,
      available: false,
      snapshotUrl: null,
      snapshotDate: null,
    };
  }
}

app.get('/', (req, res) => {
  res.render('index', {
    currentPage: 'home',
    fortune: getFortune(),
    screenNames: getScreenNames(),
  });
});

app.get('/connection', (req, res) => {
  res.render('connection', {
    currentPage: 'connection',
    fortune: getFortune(),
    screenNames: getScreenNames(),
  });
});

app.get('/websites', async (req, res) => {
  const archivedWebsites = await Promise.all(
    classicWebsites.map(getArchivedWebsite),
  );

  const websites = archivedWebsites.map((website) => ({
    ...website,
    formattedDate: formatArchiveDate(website.snapshotDate),
  }));

  res.render('websites', {
    currentPage: 'websites',
    fortune: getFortune(),
    screenNames: getScreenNames(),
    websites,
  });
});

app.get('/modern', (req, res) => {
  res.render('modern', {
    currentPage: 'modern',
    fortune: getFortune(),
    screenNames: getScreenNames(),
  });
});

app.get('/slang', (req, res) => {
  res.render('slang', {
    currentPage: 'slang',
    fortune: getFortune(),
    screenNames: getScreenNames(),
  });
});

app.get('/sources', (req, res) => {
  res.render('sources', {
    currentPage: 'sources',
    fortune: getFortune(),
    screenNames: getScreenNames(),
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started!`);
  console.log(`http://localhost:${PORT}`);
});
