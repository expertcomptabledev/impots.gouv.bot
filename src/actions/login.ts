import { TIMEOUT } from './const';
const CLI = require('clui');
const Spinner = CLI.Spinner;
const puppeteer = require('puppeteer');
import { log, logError, logSuccess, logPending, logJSON, logWarn } from '../helpers/logger';

const IMPOTS_AUTH_URL = 'https://cfspro.impots.gouv.fr/mire/accueil.do';

export const login = async (email: string, password: string, close = true): Promise<{ browser; page }> => {

  if (!email) {
    throw new Error('email must be filled or set in env variable "IMPOTS_EMAIL"');
  }

  if (!password) {
    throw new Error('password must be filled or set in env variable "IMPOTS_PASSWORD"');
  }

  const status = new Spinner('Authenticating you to impots.gouv.fr, please wait...');
  status.start();
  let page, browser;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    page = await browser.newPage();
    await page.goto(IMPOTS_AUTH_URL, {
      waitUntil: 'networkidle0',
      timeout: TIMEOUT,
    });

    page.on('request', req => {
      // log(req.url());
    });

    await page.type('#ident', email);
    await page.type('#mdp', password);

    const [response] = await Promise.all([
      page.waitForNavigation({
        timeout: TIMEOUT,
      }),
      page.$eval('#lmdp > div > form', form => form.submit()),
    ]);

    await page.waitForSelector('#mon_cpte', {
      timeout: TIMEOUT,
    });

    if (close === true) {
      await page.close();
      await browser.close();
      status.stop();
      return;
    } else {
      status.stop();
      return { browser, page };
    }
  } catch (error) {
    status.stop();
    if (page) {
      await page.close();
    }
    if (browser) await browser.close();

    logError('Error during impot login');
    logError(error);
    throw error;
  }
};
