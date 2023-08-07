// Functions

async function downloadVideo(url, path) {
  const axios = require('axios');
  const fs = require('fs');

  const video = await axios.get(url, { responseType: "stream" });
  const stream = video.data.pipe(fs.createWriteStream(path));

  return await new Promise ((resolve, reject) => {
    stream
      .on('finish', () => {
        console.log("Video downloaded!");
        resolve();
      })
      .on('error', (err) => reject(err));
  });
}

module.exports = {
  downloadVideo
}
