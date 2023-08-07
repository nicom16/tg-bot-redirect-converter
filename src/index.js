// Index
const express = require('express'); 
const app = express(); 

const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.UMORE_TOKEN);

const PORT = 8080;

app.use(express.static('public'));

app.get('/', (req, res) => res.send("Online!"));

app.get('/redirect', (req, res) => {
  
  const axios = require('axios');    
  
  axios
    .get(process.env.MANAGER, {
      params: {
        bot: req.query.bot,
        send: req.query.send,
        type: req.query.type
      }
    })
    .then((response) => res.send(`Result: ${response.data}`))
    .catch((err) => res.send(err));

}); 

app.get('/clean', (req, res) => {

  const fs = require("fs");
  const path = require("path");

  const directory = "public";

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });

  res.send("Cleaned public/ directory!");

});

app.get('/converter', (req, res) => {

  const functions = require('./functions.js');
  const fs = require('fs');
  const ffmpeg = require('./ffmpeg/index.js');
  const axios = require('axios');    

  const channel = process.env.UMORE_CHANNEL;
  const spec = req.query.spec;

  const videoName = spec + ".mp4";
  const videoPath = "./public/" + videoName;
  const gifPath = "./public/no-" + videoName;
  
  bot.telegram.getFileLink(spec)
    .then((url) => functions.downloadVideo(url, videoPath))
    .then(() => new ffmpeg(videoPath))
    .then((video) => video.setDisableAudio().setVideoCodec('copy').save(gifPath))
    .then(() => bot.telegram.sendAnimation(channel, process.env.STATIC_URL + "/no-" + videoName, { caption: process.env.UMORE_CAPTION, parse_mode: "html" }))
    .then(() => {
      fs.unlink(videoPath, (err) => err);
      fs.unlink(gifPath, (err) => err);
      axios.get(process.env.UMORE_ALTERVISTA, { 
        params: {
          gifID_unique: req.query.unique,
          chatID: req.query.chat_id
        }
      })
    })
    .catch((err) => console.log(err));

  res.send("Ok");

});

app.get('/counter', async (req, res) => {
  
  const axios = require('axios');    

  var bots = JSON.parse(process.env.BOTS);
  
  bots.forEach((bot) => {
    axios
      .get(bot, { params: { counter: true } })
      .catch((err) => console.log(err));
  });

  res.send("Counted!");

});

app.get('/requests', (req, res) => {

  const axios = require('axios');    

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


// Routes for pep-app
app.get('/pep', (req, res) => {

  const axios = require('axios');    

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
  
  const axios = require('axios');    
  
  var pep = JSON.parse(process.env.PEPON); 
  
  axios
    .get(pep[req.query.index])
    .then((response) => res.send(`Ok: ${response}`));

});

app.get('/pep-requests-off', (req, res) => {
  
  const axios = require('axios');    

  var pep = JSON.parse(process.env.PEPOFF); 
  
  axios
    .get(pep[req.query.index])
    .then((response) => res.send(`Ok: ${response}`));

});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));

