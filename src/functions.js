// Functions

async function getFile(url, token) {
    const axios = require('axios');

    const response = await axios.get(url);
    return "https://api.telegram.org/file/bot" + token + "/" + response.data.result.file_path;
}
    
async function downloadVideo(url, name) {
    const axios = require('axios');
    const fs = require('fs');
    
    const response = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream("./public/" + name);
    await new Promise ((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

module.exports = {
    getFile,
    downloadVideo
}
