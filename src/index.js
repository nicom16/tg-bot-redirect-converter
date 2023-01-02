// Express 
const express = require('express'); 
const app = express(); 

const axios = require('axios');    

const ffmpeg = require('ffmpeg');

const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TOKEN);

const functions = require('./functions.js');

const PORT = process.env.PORT || 5000;

app.use(express.static('public'));

app.get('/online', (req, res) => res.send("Online!"));

app.get('/', (req, res) => {
    axios.get(process.env.MANAGER, {
        params: {
            bot: req.query.bot,
            send: req.query.send,
        },
    }).then((response) => {
        res.send(`Result: ${response.data}`);
    }).catch((err) => {
        res.send(err);
    });
}); 

/*app.get('/del', async () => {
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
res.send("Done!");
});*/

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
        .then(() => bot.telegram.sendAnimation(channel, process.env.RAILWAY_STATIC_URL + "/no-" + video_name, { caption: req.query.caption }))
	.then((result) => {
            fs.unlink("./public/" + video_name, (err) => err);
            fs.unlink("./public/no-" + video_name, (err) => err);
	    bot.telegram.sendMessage(req.query.chat_id, "Video convertito ed inviato sul canale!");
	})
        .catch((err) => console.log("Errore: " + err));
    
    //res.send("Ok");
});

app.get('/pep', (req, res) => {
    const axios = require('axios');
    
    axios.get(req.query.bot_page, {
        params: {
            send: req.query.send,
        },
    }).then((response) => {
        res.send(`Result: ${response.data}`);
    }).catch((err) => {
        res.send(err);
    });
}); 

app.listen(PORT, () => { 
  console.log(`App listening on port ${PORT}`); 
});

