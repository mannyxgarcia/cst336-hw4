import express from 'express';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', {
    currentPage: 'home',
  });
});

app.get('/connection', (req, res) => {
  res.render('connection', {
    currentPage: 'connection',
  });
});

app.get('/websites', (req, res) => {
  res.render('websites', {
    currentPage: 'websites',
  });
});

app.get('/modern', (req, res) => {
  res.render('modern', {
    currentPage: 'modern',
  });
});

app.get('/sources', (req, res) => {
  res.render('sources', {
    currentPage: 'sources',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started!`);
  console.log(`http://localhost:${PORT}`);
});
