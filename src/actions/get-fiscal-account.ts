import { login } from './login';
import { TIMEOUT } from './const';
declare var document;
import { log, logError, logSuccess, logPending, logJSON, logWarn } from '../helpers/logger';

export const getFiscalAccount = async (email: string, password: string, siren: string, close = true) => {
  const url = `https://cfspro.impots.gouv.fr/webadelie/servlet/consulterEntreprise.html?&vue=usager&t=L&siren=${siren}`;

  const { browser, page } = await login(email, password, false);

  await page.goto(url, {
    timeout: TIMEOUT,
  });

  const selector = '#chemin_de_fer > a';

  await page.waitForSelector(selector, { timeout: TIMEOUT });
  const textCheminFer = await page.evaluate(selector => document.querySelector(selector).textContent, selector);

  if (textCheminFer.indexOf('compte fiscal') > -1) {
    return { browser, page };
  } else {
    throw new Error('Something looks wrong during get fiscal account');
  }
};
