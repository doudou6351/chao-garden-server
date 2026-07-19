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
            <a href="/guestbook"><img class="grow" src="client/img/guestbook.png"></a>
        </div>
        <footer class="fixed"><img src="client/img/footer.png"></footer>
    </body>
</html>`);
});

app.get('/guestbook', (req, res) => {
  const entries = db.getGuestbookEntries();
  const entryRows = entries.map(e => {
    const stars = '★'.repeat(e.stars) + '☆'.repeat(5 - e.stars);
    return `<div class="gb-entry">
      <div class="gb-header"><span class="gb-pseudo">${e.pseudo}</span> <span class="gb-stars">${stars}</span> <span class="gb-date">${e.created_at}</span></div>
      <div class="gb-message">${e.message}</div>
    </div>`;
  }).join('\n');

  res.send(`<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>chao.garden - guestbook</title>
        <link href="https://fonts.googleapis.com/css?family=Lato&amp;subset=latin,latin-ext" rel="stylesheet" type="text/css">
        <link href="client/js/lib/fontawesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
        <link href="client/js/lib/animate.css/animate.min.css" rel="stylesheet" type="text/css">
        <link href="client/css/main.css" rel="stylesheet" type="text/css">
        <script data-main="client/js/app.min" src="client/js/lib/requirejs/require.js"></script>
        <style>
          .gb-container { max-width: 700px; margin: 40px auto; padding: 20px; }
          .gb-container h1 { text-align: center; font-size: 2em; margin-bottom: 30px; text-transform: uppercase; }
          .gb-form { border: 3px solid black; border-radius: 20px; padding: 30px; margin-bottom: 30px; background: white; }
          .gb-form label { display: block; margin: 12px 0 4px; font-size: 25px; text-transform: uppercase; }
          .gb-form input, .gb-form textarea { width: 100%; padding: 10px; border: 3px solid black; border-radius: 10px; font-family: Lato, sans-serif; font-size: 20px; box-sizing: border-box; }
          .gb-form textarea { height: 100px; resize: vertical; }
          .gb-form .star-select { display: flex; flex-direction: row-reverse; justify-content: flex-end; gap: 4px; margin: 8px 0; }
          .gb-form .star-select input { display: none; }
          .gb-form .star-select label { font-size: 40px; cursor: pointer; color: #ccc; margin: 0; transition: color .2s; }
          .gb-form .star-select input:checked ~ label,
          .gb-form .star-select label:hover,
          .gb-form .star-select label:hover ~ label { color: #f5c518; }
          .gb-form button { background: #4ccfff; color: black; border: 3px solid black; border-radius: 10px; padding: 12px 30px; font-size: 25px; cursor: pointer; margin-top: 15px; text-transform: uppercase; font-family: Lato, sans-serif; }
          .gb-form button:hover { background: #3ab8e0; }
          .gb-entry { border: 3px solid black; border-radius: 20px; padding: 20px; margin-bottom: 12px; background: white; }
          .gb-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
          .gb-pseudo { font-weight: bold; text-transform: uppercase; font-size: 20px; }
          .gb-stars { color: #f5c518; font-size: 24px; }
          .gb-date { color: #666; font-size: 14px; margin-left: auto; }
          .gb-message { font-size: 18px; line-height: 1.5; white-space: pre-wrap; }
          .gb-empty { text-align: center; padding: 40px; font-style: italic; font-size: 20px; }
          .gb-back { text-align: center; margin-top: 30px; }
          .gb-back a { color: black; text-decoration: none; font-size: 20px; text-transform: uppercase; border: 3px solid black; border-radius: 10px; padding: 10px 20px; display: inline-block; background: white; }
          .gb-back a:hover { background: #4ccfff; }
          #gb-error { color: red; margin-top: 8px; display: none; font-size: 18px; }
        </style>
    </head>
    <body>
        <header>
            <a href="/"><img src="client/img/logo.png"></a>
            <a href="https://hedgehog.exposed"><img class="fansonly-badge" src="client/img/fansonly.png"></a>
        </header>
        <div class="gb-container">
            <h1>GUESTBOOK</h1>
            <div class="gb-form">
                <form id="guestbook-form">
                    <label for="pseudo">Pseudo</label>
                    <input type="text" id="pseudo" name="pseudo" maxlength="50" required placeholder="your name...">
                    <label>Stars</label>
                    <div class="star-select" id="star-select">
                        <input type="radio" name="stars" id="s5" value="5"><label for="s5">★</label>
                        <input type="radio" name="stars" id="s4" value="4"><label for="s4">★</label>
                        <input type="radio" name="stars" id="s3" value="3"><label for="s3">★</label>
                        <input type="radio" name="stars" id="s2" value="2"><label for="s2">★</label>
                        <input type="radio" name="stars" id="s1" value="1"><label for="s1">★</label>
                    </div>
                    <label for="message">Message</label>
                    <textarea id="message" name="message" maxlength="2000" required placeholder="write something..."></textarea>
                    <button type="submit">Send</button>
                    <div id="gb-error"></div>
                </form>
            </div>
            <div id="gb-entries">
                ${entryRows || '<div class="gb-empty">No messages yet. Be the first!</div>'}
            </div>
            <div class="links" style="margin-top:30px">
                <a href="http://www.arcanekids.com/"><img class="grow" src="client/img/arcanekids.png"></a>
                <a href="https://hedgehog.exposed"><img class="grow" src="client/img/playnow.gif"></a>
                <a href="/guestbook"><img class="grow" src="client/img/guestbook.png"></a>
            </div>
        </div>
        <footer class="fixed"><img src="client/img/footer.png"></footer>
        <script>
          document.getElementById('guestbook-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const pseudo = document.getElementById('pseudo').value.trim();
            const stars = document.querySelector('input[name="stars"]:checked');
            const message = document.getElementById('message').value.trim();
            const errorDiv = document.getElementById('gb-error');
            if (!stars) { errorDiv.textContent = 'Please select a star rating.'; errorDiv.style.display = 'block'; return; }
            errorDiv.style.display = 'none';
            try {
              const res = await fetch('/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pseudo, stars: stars.value, message })
              });
              if (!res.ok) throw new Error('Failed to submit');
              location.reload();
            } catch(err) {
              errorDiv.textContent = 'Error submitting. Try again.';
              errorDiv.style.display = 'block';
            }
          });
        </script>
    </body>
</html>`);
});

app.get('/angels/:name', (req, res) => {
  const angel = db.getAngel(req.params.name);
  if (!angel) return res.status(404).send('Angel not found');

  const traitValue = (angel.ascensions + Math.floor(Math.random() * 1000)).toString();

  let nature = 'neutral';
  if (angel.ascensions >= 10000) nature = 'evil';
  else if (angel.ascensions >= 1000) nature = 'hero';

  const chaoHtml = ['evil', 'neutral', 'hero'].map(t =>
    `<div class="chao ${t === nature ? 'active' : ''} chao-chao_${t}"></div>`
  ).join('\n                ');

  const twitterImage = nature === 'evil' ? '../client/img/chao_evil.png'
    : nature === 'hero' ? '../client/img/chao_hero.png'
    : '../client/img/chao_neutral.png';

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
        <meta name="twitter:image" content="${twitterImage}"/>
    </head>
    <body>
        <header>
            <a href="../"><img src="../client/img/logo.png"></a>
            <a href="https://hedgehog.exposed"><img class="fansonly-badge" src="../client/img/fansonly.png"></a>
        </header>
        <div id="angel-container">
            <div id="angel-avatar-container" data-nature="${nature}">
                ${chaoHtml}
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
                <a href="https://twitter.com/intent/tweet?text=It%27s%20a%20miracle!%20Check%20out%20${encodeURIComponent(angel.name)}%20with%20${angel.ascensions.toLocaleString()}%20ascensions!&via=arcanekids" target="_blank" style="display:inline-block;border:3px solid black;border-radius:10px;padding:10px 20px;background:white;color:black;text-decoration:none;font-size:20px;text-transform:uppercase;">𝕏 Share</a>
            </div>
        </div>
        <div class="links">
            <a href="http://www.arcanekids.com/"><img class="grow" src="../client/img/arcanekids.png"></a>
            <a href="https://hedgehog.exposed"><img class="grow" src="../client/img/playnow.gif"></a>
            <a href="/guestbook"><img class="grow" src="../client/img/guestbook.png"></a>
        </div>
        <footer class="fixed"><img src="../client/img/footer.png"></footer>
    </body>
</html>`);
});

app.get('/api/guestbook', (req, res) => {
  res.json(db.getGuestbookEntries());
});

app.post('/api/guestbook', (req, res) => {
  const { pseudo, stars, message } = req.body;
  if (!pseudo || !stars || !message) {
    return res.status(400).json({ error: 'pseudo, stars, and message are required' });
  }
  const s = parseInt(stars);
  if (s < 1 || s > 5) {
    return res.status(400).json({ error: 'stars must be between 1 and 5' });
  }
  if (pseudo.length > 50 || message.length > 2000) {
    return res.status(400).json({ error: 'pseudo max 50 chars, message max 2000 chars' });
  }
  const entry = db.addGuestbookEntry(pseudo.trim(), s, message.trim());
  res.status(201).json(entry);
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
