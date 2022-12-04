// Express 
const express = require('express'); 
const app = express(); 
const PORT = process.env.PORT || 5000 
  
app.get('/', (req, res) => {
    const axios = require('axios');
    
    if (req.query.send !== undefined) {
        axios.get(process.env.MANAGER, {
            params: {
                bot: req.query.bot,
                send: req.query.send,
            },
        }).then((response) => {
            console.log(response.data);
        });
    } else {
        axios.get(process.env.MANAGER, {
            params: {
                bot: req.query.bot,
            },
        }).then((response) => {
            console.log(response.data);
        });
    }
    
    res.send(process.env.MANAGER); 
}); 
  
app.listen(PORT, () => { 
  console.log(`App listening on port ${PORT}`); 
});

