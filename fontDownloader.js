const request = require("request");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const _ = require("lodash");

function createDirectory(options) {
  return new Promise(function(resolve, reject) {
    mkdirp(options.destination, function(err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function downloadFont(destination, font) {
  return new Promise(function(resolve, reject) {
    var out = fs.createWriteStream(path.join(destination, font.name));

    out.on("error", function(err) {
      reject(err);
    });

    out.on("finish", function() {
      resolve();
    });

    request(font.url).pipe(out);
  });
}

function downloadFonts(options, parsingResults) {
  return createDirectory(options).then(function() {
    function download(obj) {
      downloadFont(options.destination, obj);
    }

    return Promise.all(_.map(parsingResults.fontUrls, download));
  });
}

module.exports = downloadFonts;
module.exports.default = downloadFonts;
