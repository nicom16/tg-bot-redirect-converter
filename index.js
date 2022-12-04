// Express 
const express = require('express'); 
const app = express(); 
const PORT = process.env.PORT || 5000 
  
app.get('/', (req, res) => {
    const axios = require('axios');
    
    axios.get(process.env.MANAGER, {
        params: {
            bot: req.query.bot,
            send: req.query.send,
        },
    }).then((response) => {
        console.log(response.data);
    });
    
    res.send('Redirected!'); 
}); 
  
app.listen(PORT, () => { 
  console.log(`App listening on port ${PORT}`); 
});

