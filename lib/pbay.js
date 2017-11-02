var request = require('request')
  , rp = require('request-promise')
  , cheerio = require('cheerio')
  , qs = require('querystring')
  , wrap = require('word-wrap')
  , colors = require('colors')
  , arraySort = require('array-sort')
  ;

// URL
exports.url = 'https://proxyproxyproxy.nl/';

/**
* Search for torrents using the provided keywords.
*/
exports.search = function (keywords, callback) {
  var params = keywords;
  
  var searchURL = exports.buildQueryString('search', params);
  request(searchURL, function (error, response, body) {
    if (error) throw error;

    if (!error && response.statusCode == 200) {
      extractTorrents(body, (torrents) => {
        callback(torrents);
      });
    }
  })
}

/**
* Helper to build a query string.
*/
exports.buildQueryString = function (path, params) {
  return exports.url + '/' + path + '/' + qs.escape(params);
}

/**
* Extracts torrents from string using cheerio.
*/
function extractTorrents(string, callback) {
  var torrents = [];
  const $ = cheerio.load(string);

  let deferreds = [];
  $("table#searchResult").find('tr').each(function () {
    if (!$(this).hasClass('header')) {
      var torrent = {};
      deferreds.push(
        getMagnet($(this).find('.detLink').attr('href'))
          .then((magnetLink) => {
            torrent.magnet = magnetLink;
            torrent.title = $(this).find('.detLink').text();
            torrent.seeders = $(this).find('td').eq(2).text();
            torrent.leechers = $(this).find('td').eq(3).text();
            torrent.category = $(this).find('td').eq(0).find('a').eq(0).text();
            torrent.subcategory = $(this).find('td').eq(0).find('a').eq(1).text();
            torrents.push(torrent);
          })
      );
    }
  });

  Promise.all(deferreds).then(() => {
    callback(torrents);
  })

}

/**
* Extracts torrents from string using cheerio.
*/
getMagnet = async function (string) {
  if (string.startsWith("magnet:")) {
    return string;
  } else {
    const queryString = exports.url + string;
    var body = await rp(queryString);
    const $ = cheerio.load(body);
    return $('a[title="Get this torrent"]').eq(0).attr('href');
  }
}

/**
* Logs torrents to the console in tabuler format.
*/
exports.displayTorrents = function (torrents) {
  const sortedTorrents = arraySort(torrents, (a, b) => (a.seeders - b.seeders))
  for (var i in sortedTorrents) {
    var torrent = torrents[i];
    console.log(wrap(torrent.seeders, { width: 7 }), wrap(torrent.leechers, { width: 7 }), colors.green(torrent.title), colors.gray(' [' + torrent.category + ']'));
    console.log(torrent.magnet);
    console.log('─────────────────────────────────────────────────────────────────');
  }
}