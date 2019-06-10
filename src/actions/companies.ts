import { login } from './login';
import { TIMEOUT } from './const';
declare var document, fetch;
var flat = require('array.prototype.flat');
import { log, logError, logSuccess, logPending, logJSON, logWarn } from '../helpers/logger';
import { Companie } from '../models/companie';
import { getFiscalInformationsFromLoggedSession} from './get-fiscal-informations';
const CLI = require('clui');
const Spinner = CLI.Spinner;

const COMPANIES_URL =
  'https://cfspro.impots.gouv.fr/mire/afficherChoisirDossier.do?idth=dossier2&action=tousMesDossier';

export const getCompanies = async (email: string, password: string, getFiscalInformation = false, close = true): Promise<Array<Companie>> => {
  try {
    const { browser, page } = await login(email, password, false);

    let status = new Spinner('Getting companies informations..');
    status.start();

    if (!browser || !page) {
      throw new Error('browser and page not sent by login feature');
    }

    await page.goto(COMPANIES_URL, {
      timeout: TIMEOUT,
      waitUntil: 'domcontentloaded',
    });

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#ins_contenu > ul li > a'))
        .map((node: any) => node.href)
        .filter(function(item, pos, self) {
          return self.indexOf(item) == pos;
        });
    });

    const extractCompanies = async page => {
      return await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#ins_contenu > form > table.listing.onecol > tbody label'))
          .map((node: any) => node.textContent)
          .map(company => company.split('SIREN'))
          .map(companyData => {
            return { name: companyData[0].trim(), siren: companyData[1].trim() };
          })
          .filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
          });
      });
    };

    // extract first page
    let companies = await extractCompanies(page);

    for await (const link of links) {
      await page.goto(link, {
        timeout: TIMEOUT,
        waitUntil: 'domcontentloaded',
      });
      const extractedCompanies = await extractCompanies(page);
      companies = companies.concat(extractedCompanies);
    }

    companies = flat(companies);

    status.stop();

    // if fiscal asked
    if(getFiscalInformation){

      let status = new Spinner('Getting companies fiscal informations..');
      status.start();

      for await(const c of companies) {
        const infos = await getFiscalInformationsFromLoggedSession(browser, page, c.siren);
        Object.keys(infos).map(k => c[k] = infos[k]);
      }

      status.stop();

    }

    browser.close();

    return companies;

  } catch (error) {

    logError('Something was wrong during get companies');
    logError(error);
    return [];

  }
};
