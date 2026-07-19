const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('short'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/client', express.static(path.join(__dirname, 'public', 'client')));

app.get('/', (req, res) => {
  const angels = db.getAllAngels();
  const rows = angels.map(a => `
            <tr class="ascensions-row" data-angel-url="/angels/${a.name}">
                <td>
                    <div class="name-container">
                        <a href="angels/${a.name}">${a.name}</a>
                    </div>
                </td>
                <td>
                    <div class="ascensions-container">
                        ${a.ascensions.toLocaleString()}
                    </div>
                </td>
            </tr>`).join('\n');

  res.send(`<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>chao.garden</title>
        <link href="https://fonts.googleapis.com/css?family=Lato&amp;subset=latin,latin-ext" rel="stylesheet" type="text/css">
        <link href="client/js/lib/fontawesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
        <link href="client/js/lib/animate.css/animate.min.css" rel="stylesheet" type="text/css">
        <link href="client/css/main.css" rel="stylesheet" type="text/css">
        <script data-main="client/js/app.min" src="client/js/lib/requirejs/require.js"></script>
    </head>
    <body>
        <header>
            <a href="https://hedgehog.exposed">
                <img src="client/img/logo.png">
            </a>
            <a href="https://hedgehog.exposed">
                <img class="fansonly-badge" src="client/img/fansonly.png">
            </a>
        </header>
        <table id="helpful-egg"><tbody><tr>
            <td><a href="https://hedgehog.exposed"><img class="grow" src="client/img/eggperson.png"></a></td>
            <td><a href="https://hedgehog.exposed">seems like you might be lost?</a></td>
        </tr></tbody></table>
        <div id="ascensions-table-container">
            <table class="ascensionstable"><tbody>
                <tr><td><div class="name-container"><img src="client/img/angelid.png"></div></td>
                    <td><div class="ascensions-container"><img src="client/img/ascensions.png"></div></td></tr>
                ${rows}
            </tbody></table>
        </div>
        <div class="links">
            <a href="http://www.arcanekids.com/"><img class="grow" src="client/img/arcanekids.png"></a>
            <a href="https://hedgehog.exposed"><img class="grow" src="client/img/playnow.gif"></a>
            <a href="/"><img class="grow" src="client/img/guestbook.png"></a>
        </div>
        <footer class="fixed"><img src="client/img/footer.png"></footer>
    </body>
</html>`);
});

app.get('/angels/:name', (req, res) => {
  const angel = db.getAngel(req.params.name);
  if (!angel) return res.status(404).send('Angel not found');

  const traitValue = (angel.ascensions + Math.floor(Math.random() * 1000)).toString();

  res.send(`<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>chao.garden - ${angel.name}</title>
        <link href="https://fonts.googleapis.com/css?family=Lato&amp;subset=latin,latin-ext" rel="stylesheet" type="text/css">
        <link href="../client/js/lib/fontawesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
        <link href="../client/js/lib/animate.css/animate.min.css" rel="stylesheet" type="text/css">
        <link href="../client/css/main.css" rel="stylesheet" type="text/css">
        <script data-main="../client/js/app.min" src="../client/js/lib/requirejs/require.js"></script>
        <meta name="twitter:card" content="summary"/>
        <meta name="twitter:site" content="@arcanekids"/>
        <meta name="twitter:title" content="Check Out The Angel ${angel.name}!"/>
        <meta name="twitter:description" content="WOW!...${angel.ascensions.toLocaleString()} ascensions!"/>
        <meta name="twitter:image" content="../client/img/chao_hero.png"/>
    </head>
    <body>
        <header>
            <a href="../"><img src="../client/img/logo.png"></a>
            <a href="https://hedgehog.exposed"><img class="fansonly-badge" src="../client/img/fansonly.png"></a>
        </header>
        <div id="angel-container">
            <div id="angel-avatar-container" data-nature="hero">
                <div class="chao  chao-chao_evil"></div>
                <div class="chao  chao-chao_neutral"></div>
                <div class="chao active chao-chao_hero"></div>
            </div>
            <div id="angel-stats-container">
                <table id="angel-stats-table">
                    <tr>
                        <td class="angel-stat-image"><img src="../client/img/angelid.png"></td>
                        <td class="angel-stat-values"><div>${angel.name}</div></td>
                    </tr>
                    <tr>
                        <td class="angel-stat-image"><img src="../client/img/ascensions.png" style="width: 75%; padding-top: 26px; vertical-align: middle;"></td>
                        <td class="angel-stat-values"><div>${angel.ascensions.toLocaleString()}</div></td>
                    </tr>
                    <tr>
                        <td class="angel-stat-image"><img src="../client/img/traits.png"></td>
                        <td class="angel-stat-values">
                            <div class="">
                                <div class="trait"><span class="mystery">Mystery <i class="fa fa-question-circle fa-fw"></i></span><span class="value add"><i class="fa fa-plus fa-fw"></i>${traitValue}</span></div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <div id="angel-twitter-container">
                <a href="https://twitter.com/share" class="twitter-share-button" data-text="It's a miracle!" data-via="arcanekids" data-size="large">Tweet</a>
            </div>
        </div>
        <div class="links">
            <a href="http://www.arcanekids.com/"><img class="grow" src="../client/img/arcanekids.png"></a>
            <a href="https://hedgehog.exposed"><img class="grow" src="../client/img/playnow.gif"></a>
            <a href="/"><img class="grow" src="../client/img/guestbook.png"></a>
        </div>
        <footer class="fixed"><img src="../client/img/footer.png"></footer>
    </body>
</html>`);
});

app.get('/api/angels', (req, res) => {
  res.json(db.getAllAngels());
});

app.get('/api/angels/:name', (req, res) => {
  const angel = db.getAngel(req.params.name);
  if (!angel) return res.status(404).json({ error: 'Angel not found' });
  res.json(angel);
});

app.all('/gbook/chaogarden/api/users/:name/ascend', (req, res) => {
  const name = req.params.name;
  const angel = db.upsertAngel(name);

  res.json({
    success: true,
    name: angel.name,
    ascensions: angel.ascensions,
    traits: [{ name: 'Mystery', value: angel.ascensions }]
  });
});

app.use('/gbook', (req, res) => {
  res.json({ status: 'ok', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chao Garden server running on http://0.0.0.0:${PORT}`);
  db.seedOriginalAngels();
});
