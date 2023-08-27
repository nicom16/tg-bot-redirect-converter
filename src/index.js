// Index
const express = require('express'); 
const app = express(); 

const PORT = 8080;

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

app.get('/converter', (req, res) => {

  const { exec } = require('child_process');
  const { promisify } = require('util');
  const promisifiedExec = promisify(exec);

  const functions = require('./functions.js');
  const fs = require('fs');
  const path = require('path');
  const axios = require('axios');    

  const { Telegraf } = require('telegraf');
  const bot = new Telegraf(process.env.A_TOKEN);
  
  const channel = process.env.A_CHANNEL;
  const spec = req.query.spec;

  const videoName = spec + ".mp4";
  const videoPath = path.join("converter", videoName);
  const gifPath = path.join("converter", `no-${videoName}`);
  
  functions.cleanDir("converter")
    .then(() => bot.telegram.getFileLink(spec))
    .then((url) => functions.downloadFile(url, videoPath))
    .then(() => promisifiedExec(`ffmpeg -i ${videoPath} -c copy -an ${gifPath}`))
    .then(() => bot.telegram.sendAnimation(channel, { source: gifPath }, { caption: req.query.caption, parse_mode: "html" }))
    .then(() => {
      fs.unlink(videoPath, (err) => err);
      fs.unlink(gifPath, (err) => err);
      axios.get(process.env.A_ALTERVISTA, { 
        params: {
          gifID_unique: req.query.unique,
          chatID: req.query.chat_id
        }
      })
    })
    .catch((err) => console.log(err));

  res.send("Ok");

});

app.get('/blur', (req, res) => {
  
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const promisifiedExec = promisify(exec);
  
  const functions = require('./functions.js');
  const { Telegraf } = require('telegraf');
  const fs = require('fs');
  const path = require('path');
  const axios = require('axios');

  const spec = req.query.spec;
  if (req.query.name == "b") {
    var bot = new Telegraf(process.env.B_TOKEN);
    var channel = process.env.B_CHANNEL;
    var altervista = process.env.B_ALTERVISTA;
    var baseDirectory = "blur-b";
  } else {
    var bot = new Telegraf(process.env.C_TOKEN);
    var channel = process.env.C_CHANNEL;
    var altervista = process.env.C_ALTERVISTA;
    var baseDirectory = "blur-c";
  }
  
  const picName = spec + ".jpg";
  const picPath = path.join(baseDirectory, picName);
  const blurredPicPath = path.join(baseDirectory, `b-${picName}`);
  
  functions.cleanDir(baseDirectory)
    .then(() => bot.telegram.getFileLink(spec))
    .then((url) => functions.downloadFile(url, picPath))
    .then(() => promisifiedExec(`identify ${picPath} | awk -F' ' '{ print $3 }'`))
    .then((output) => {
      const size = output.stdout.split('x');

      if (size[0] >= size[1]) {
        return promisifiedExec(`convert ${picPath} -gravity SouthEast -region 180x60+0+0 -blur 0x20 ${blurredPicPath}`);
      } else {
        return promisifiedExec(`convert ${picPath} -gravity SouthEast -region 370x90+0+0 -blur 0x20 ${blurredPicPath}`);
      }
    })
    .then(() => console.log("Blurred!"))
    .then(() => bot.telegram.sendPhoto(channel, { source: blurredPicPath }, { caption: req.query.caption, parse_mode: "html" }))
    .then(() => {
      fs.unlink(picPath, (err) => err);
      fs.unlink(blurredPicPath, (err) => err);
      axios.get(altervista, { 
        params: {
          unique_id: req.query.unique
        }
      })
    })
    .catch((err) => console.log(err));

  res.send('Blurring!');

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

