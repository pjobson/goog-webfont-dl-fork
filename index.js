const request     = require("request");
const path        = require("path");
const querystring = require("querystring");

const cssParser      = require("./cssParser");
const fontDownloader = require("./fontDownloader");

const allFormats = ["ttf", "eot", "woff", "woff2", "svg"];
const allStyles = [
  "100",       "300",       "400",       "700",       "900",
  "100italic", "300italic", "400italic", "700italic", "900italic",
];

const googWebFontDl = async (options) => {
  options = (typeof options === "string") ? { font: options } : options;

  if (options.font == null) {
    throw new Error("You need to give a font name as downloader({ font: 'name' })");
  }

  options.destination = (options.destination == null) ? options.font : options.destination;
  options.destination = path.resolve(options.destination);

  options.formats = allFormats;
  options.styles = allStyles;

  let url = `https://fonts.googleapis.com/css?family=${querystring.escape(options.font)}:${options.styles}`

  if (options.subset) {
    url = `${url}&subset=${querystring.escape(options.subset)}`;
  }

  console.log(`Downloading webfont formats: "${options.formats}" to folder "${options.destination}"`);

  cssParser(options, url).then(async fontlist => {
    fontDownloader(options, fontlist.flat());
  });
}

module.exports = googWebFontDlFork;
module.exports.default = googWebFontDlFork;  // ES6: import downloader from 'goog-webfont-dl'
module.exports.formats = allFormats;
module.exports.styles = allStyles;
