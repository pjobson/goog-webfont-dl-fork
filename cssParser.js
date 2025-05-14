const util = require("node:util");
const request = require("request");
const css = require("css");

const userAgentMap = {
  woff2: "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/40.0",
  woff:  "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
  eot:   "Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)",
  svg:   "Mozilla/4.0 (iPad; CPU OS 4_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/4.1 Mobile/9A405 Safari/7534.48.3",
  ttf:   "node.js"
};

const downloadCSS = (format, url) => {
  return new Promise((resolve, reject) => {
    const opts = {
      url: url,
      headers: {
        "User-Agent": userAgentMap[format]
      }
    };

    request(opts, (err, response, body) => {
      if (err) {
        return reject(err);
      } else if (response.statusCode !== 200) {
        return reject(new Error(`Bad response code: ${response.statusCode}`));
      }

      resolve(body);
    });
  });
}

const getSubObj = (obj, props) => {
  let curr = obj;
  for (const prop of props) {
    let subObj = curr[prop];
    if (!subObj) {
      subObj = {};
      curr[prop] = subObj;
    }
    curr = subObj;
  }
  return curr;
}

const parseFontsFromCSS = (format, options, cssText) => {
  const ast = css.parse(cssText);
  const rules = ast.stylesheet.rules;

  if (!util.isArray(rules)) {
    throw new Error("Problem parsing cssText");
  }

  const fontlist = [];

  for (const rule of rules) {
    if (util.isUndefined(rule.type)) continue;
    if (rule.type !== "font-face") continue;
    if (!util.isArray(rule.declarations)) continue;

    const CURFONT = {
      family:   null,
      style:    null,
      weight:   null,
      url:      null,
      filename: null,
      format:   format
    }

    for (const declaration of rule.declarations) {
      switch(declaration.property) {
        case 'font-family':
          CURFONT.family = declaration.value.replace(/^'(.+?)'$/, "$1");
          break;
        case 'font-style':
          CURFONT.style = declaration.value;
          break;
        case 'font-weight':
          CURFONT.weight = declaration.value;
          break;
        case 'src':
          CURFONT.url = declaration.value.replace(/url\((.+?)\).*/,"$1");
          break;
      }
      CURFONT.filename = `${CURFONT.family}-${CURFONT.style}-${CURFONT.weight}.${CURFONT.format}`.replace(/\s/g,'_')
      if (fontlist.map(font => font.filename).indexOf(CURFONT.filename) === -1) {
        fontlist.push(CURFONT);
      }
    }
  }
  return fontlist;
}

const downloadAndParseCSS = (options, url) => {
  return Promise.all([...options.styles].map(async format => {
    const cssText = await downloadCSS(format, url);
    const fontlist = await parseFontsFromCSS(format, options, cssText);
    return fontlist;
  }));
}

module.exports = downloadAndParseCSS;
module.exports.default = downloadAndParseCSS;
module.exports.userAgentMap = userAgentMap;
