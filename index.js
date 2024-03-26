const request     = require("request");
const path        = require("path");
const posix       = require("path").posix;
const querystring = require("querystring");

const cssParser      = require("./cssParser");
const fontDownloader = require("./fontDownloader");
const cssGenerator   = require("./cssGenerator");

const allFormats = ["ttf", "eot", "woff", "woff2", "svg"];
const allStyles = [
  "100",       "300",       "400",       "700",       "900",
  "100italic", "300italic", "400italic", "700italic", "900italic",
];

const googWebFontDl = async (options) => {
  options = (typeof options === "string") ? { font: options } : options;

  if (options.font == null) {
    throw new Error("You need to give a font name as downloader('name') or downloader({ font: 'name' })");
  }

  if (options.prefix == null) {
    options.prefix = posix.join("..", "fonts", options.font);
  }

  if (options.destination == null) {
    options.destination = options.font;
  }

  options.destination = path.normalize(options.destination);

  let formats = options.formats;
  if (formats == null || formats === "all") {
    formats = allFormats;
  }

  if (formats.length === 0) {
    throw new Error("please select at least one format (or -a for all formats)");
  }

  for (const fmt of formats) {
    if (!cssParser.userAgentMap[fmt]) {
      throw new Error("Unknown format “" + fmt + "”");
    }
  }

  if (!options.styles) {
    options.styles = allStyles;
  }

  let url = `https://fonts.googleapis.com/css?family=${querystring.escape(options.font)}:${options.styles}`

  if (options.subset) {
    url = `${url}&subset=${querystring.escape(options.subset)}`;
  }

  if (options.verbose) {
    console.log(`Downloading webfont formats: "${formats}" to folder "${options.destination}"`);
  }

  if (options.proxy) {
    request = request.defaults({"proxy": options.proxy});
  }

  cssParser(options, url).then(list => {
    console.log(list);
  })
  // return cssParser(options, url, parsingResults).then(() => {
  //   return fontDownloader(options, parsingResults);
  // }).then(() => {
  //   return cssGenerator(options, parsingResults);
  // });
}

module.exports = googWebFontDl;
module.exports.default = googWebFontDl;  // ES6: import downloader from 'goog-webfont-dl'
module.exports.formats = allFormats;
module.exports.styles = allStyles;
