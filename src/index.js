// Express 
const express = require('express'); 
const app = express(); 

const axios = require('axios');    

const ffmpeg = require('ffmpeg');

const fs = require('fs');

const PORT = process.env.PORT || 5000;
  
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

app.get('/converter', (req, res) => {
    res.send("Ok");
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

