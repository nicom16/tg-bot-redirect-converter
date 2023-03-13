// Index
require('dotenv').config()

const express = require('express'); 
const app = express(); 

const axios = require('axios');    

const ffmpeg = require('ffmpeg');

const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TOKEN);

const functions = require('./functions.js');

const PORT = process.env.PORT || 5000;

app.use(express.static('public'));

app.get('/', (req, res) => res.send("Online!"));

app.get('/redirect', (req, res) => {
  axios
    .get(process.env.MANAGER, {
      params: {
        bot: req.query.bot,
        send: req.query.send
      }
    })
    .then((response) => res.send(`Result: ${response.data}`))
    .catch((err) => res.send(err));
}); 

app.get('/converter', async (req, res) => {
  const fs = require('fs');

  var channel = process.env.CHANNEL;
  var spec = req.query.spec;

  var video_name = spec + ".mp4";
  
  var link = await bot.telegram.getFileLink(spec);
  
  functions.downloadVideo(link, video_name)
    .then(() => new ffmpeg("./public/" + video_name))
    .then((video) => video.setDisableAudio())
    .then((gif) => gif.save("./public/no-" + video_name))
    .then(() => bot.telegram.sendAnimation(channel, process.env.RAILWAY_STATIC_URL + "/no-" + video_name, { caption: process.env.CAPTION, parse_mode: "html" }))
    .then((result) => {
      fs.unlink("./public/" + video_name, (err) => err);
      fs.unlink("./public/no-" + video_name, (err) => err);
      axios.get(process.env.ALTERVISTA, { 
        params: {
          gifID_unique: req.query.unique,
          chatID: req.query.chat_id
        }
      })
    })
    .catch((err) => console.log("Errore: " + err));
  
  res.send("Ok");
});

app.get('/counter', async (req, res) => {
  var bots = JSON.parse(process.env.BOTS);
  
  bots.forEach((bot) => {
    axios
      .get(bot, { params: { counter: true } })
      .catch((err) => console.log(err));
  });

  res.send("Counted!");
});

app.get('/requests', (req, res) => {
  if (req.query.start) {
    var bots = JSON.parse(process.env.BOTS_START);
    bots.forEach((bot) => axios.get(bot))

    res.send("Started automatic requests acceptation and accepted pending invites!");
  } else {
    var bots = JSON.parse(process.env.BOTS_STOP);
    bots.forEach((bot) => axios.get(bot))

    res.send("Stopped automatic requests acceptation!");
  }
});

app.get('/pep', (req, res) => {
  axios
    .get(req.query.bot_page, {
      params: {
        send: req.query.send
      }
    })
    .then((response) => res.send(`Result: ${response.data}`))
    .catch((err) => res.send(err));
}); 

app.get('/pep-requests-on', (req, res) => {
  var pep = JSON.parse(process.env.PEPON); 
  
  axios.get(pep[req.query.index]);
  // Promise
  //   .all(pep.map((url) => fetch(url)))
  //   .then((allRes) => console.log(allRes));

  res.send("Ok!");
});

app.get('/pep-requests-off', (req, res) => {
  var pep = JSON.parse(process.env.PEPOFF); 
  
  axios.get(pep[req.query.index]);
  // Promise
  //   .all(pep.map((url) => fetch(url)))
  //   .then((allRes) => console.log(allRes));

  res.send("Ok!");
});

/*

app.get('/pep-requests-off', (req, res) => {
  var pep = JSON.parse(process.env.PEPOFF); 
  axios.all(pep.map((url) => axios.get(url)))
    .then((data) => console.log(data))
    .catch((err) => console.log(err));

  res.send("Ok!");
});

app.get('/pep-array-test', (req, res) => {
  var pep = JSON.parse(process.env.PEPON);
  pep.forEach((entry) => res.send(entry));
});

  */

app.listen(PORT, () => { 
  console.log(`App listening on port ${PORT}`); 
});

