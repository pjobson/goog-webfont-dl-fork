const request = require("request");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

const downloadFont = (destination, font) => {
  console.log(`Getting: ${font.filename}`)
  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(path.join(destination, font.filename));

    out.on("error", (err) => {
      reject(err);
    });

    out.on("finish", () => {
      resolve();
    });

    request(font.url).pipe(out);
  });
}

const downloadFonts = (options, fontlist) => {
  mkdirp.sync(options.destination);
  return Promise.all(fontlist.map(font => downloadFont(options.destination, font)));
}

module.exports = downloadFonts;
module.exports.default = downloadFonts;
