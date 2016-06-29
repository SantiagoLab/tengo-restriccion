import request from 'request';
import cheerio from 'cheerio';
import {__RESTRICTIONDATA_URL__} from '../config/scraping';
import {__PRODUCTION__} from '../config/envs';
import {log} from '../modules/logger';
import {sendLogEmail} from '../modules/mailSender';
import {compose, map, filter, trim, split,
        replace, test, ifElse, always, not, anyPass} from 'ramda';
import flattenTime from '../utils/flattenTime';

const noAplicaPattern = /^.*\b(\d{1,2}) de .*:[^\d]*No aplica$/i;
const noRigePattern = /^.*\b(\d{1,2}) de .*:[^\d]* No Rige$/i;
const sinRestriccionPattern = /^.*\b(\d{1,2}) de .*:Sin restricción$/i;
const expectedPattern =
            /^.*\b(\d{1,2}) de .*:.*? sin sello verde.*? \d\s?-\s?.*\d(\s?, con sello verde (\d-.*\d|No aplica))?$/i;


/**
 * Fetches numerosRestriccion from web page and parses the data
 * @return {promise}
 */
export async function fetchNumerosRestriccion(){
  try {
    const scrapeData = await scrapeNumerosRestriccion();
    return parseNumerosRestriccion(scrapeData);
  }
  catch(error) {
    log.error({'scrape#fetchNumerosRestriccion': {
      message: `Error while scraping ${__RESTRICTIONDATA_URL__}`,
      error
    }});
    throw error;
  }
}


/**
 * Parses scraped data and returns a formatted object
 * @param  {array} jsonArray scrapeNumerosRestriccion scraped data
 * @return {object}
 */
export function parseNumerosRestriccion(jsonArray) {
  const getNumbers =
          compose(
            filter(Number.isInteger),
            map(parseInt));

  const parseNumbers =
          compose(
            getNumbers,
            split('-'),
            replace(/ /g, '-'),
            trim());

  const conSelloRegex = replace(/.*, con sello verde(.*)/, '$1');
  const sinSelloRegex = replace(/^.*sin sello verde.*? (\d[\d- ]*)(,.*)?$/, '$1');
  const fechaRegex = /.*\b(\d{1,2}) de .*:.*/;
  const exceptionsPredicates = [
    test(noAplicaPattern),
    test(noRigePattern),
    test(sinRestriccionPattern)
  ];

  const parseSinSello =
    ifElse(anyPass(exceptionsPredicates),
      always([]), compose(parseNumbers, sinSelloRegex));


  const parseConSello =
    ifElse(test(/^.*, con sello verde (.*)$/),
      compose(parseNumbers, conSelloRegex), always([]));


  if(!(fechaRegex.test(jsonArray[0]))) {
    throw Error("Couldn't get 'fecha' while scraping");
  }

  const day = jsonArray[0].replace(fechaRegex, '$1');

  return {
    fecha  : getDate(day),
    estatus: jsonArray[1],
    numeros: {
      sinSello: parseSinSello(jsonArray[0]),
      conSello: parseConSello(jsonArray[0])
    }
  };
}


/**
 * Scrapes the website and resolves with an array
 * @return {promise}
 */
export function scrapeNumerosRestriccion(){
  return new Promise(function(resolve, reject){
    request.get({
      url: __RESTRICTIONDATA_URL__
    }, (error, response, html) => {
      if(error || !(response.statusCode === 200) ) {
        error = error || response;
        reject(error);
      }

      response.setEncoding('utf-8');

      const $ = cheerio.load(html.toString());

      const filterElements =
              compose(
                map(trim),
                split('\n'),
                trim);

      const scrapedData = filterElements($('.col-sm-12.restrictiontop > *').text());

      if (!test(expectedPattern, scrapedData[0]) &&
          !test(noAplicaPattern, scrapedData[0]) &&
          !test(noRigePattern, scrapedData[0]) &&
          !test(sinRestriccionPattern, scrapedData[0])) {
        const logJson = {
          message    : 'Unexpected scraped data pattern!',
          scrapedData: scrapedData
        };

        log.fatal({'scrape#fetchNumerosRestriccion': logJson});
        if(__PRODUCTION__) { sendLogEmail(logJson.message, logJson.scrapedData); }

        return reject(Error('Unexpected scraped data pattern!'));
      }

      resolve(scrapedData);
    });
  });
}


/**
 * Returns a Date with current time and specified day
 * @param  {string} day the day to set in Date
 * @return {date}
 */
function getDate(day){
  let date = new Date();
  const today = date.getDate();

  date.setDate(day);
  if(day === '1' && today >= 28) { date.setMonth(date.getMonth() + 1); }

  return flattenTime(date);
}
