import { login } from './login';
import { TIMEOUT } from './const';
declare var document;
import { log, logError, logSuccess, logPending, logJSON, logWarn } from '../helpers/logger';

export const selectCompany = async (email: string, password: string, siren: string, context?: { browser: any, page: any }) => {

  const url = `https://cfspro.impots.gouv.fr/mire/afficherChoisirDossier.do?idth=dossier12&action=choixDossier`;

  let browser, page;
  if(context){
    browser = context.browser;
    page = context.page;
  } else {
    const res = await login(email, password, false);
    browser = res.browser;
    page = res.page;
  }

  await page.goto(url, {
    timeout: TIMEOUT,
  });

  const formSelector = `#ins_contenu > table > tbody > tr:nth-child(2) > td > form`;

  await page.waitForSelector(formSelector, { timeout: TIMEOUT });

    // fill form
    await  page.type('#siren0', siren.substring(0,1));
    await  page.type('#siren1', siren.substring(1,2));
    await  page.type('#siren2', siren.substring(2,3));
    await  page.type('#siren3', siren.substring(3,4));
    await  page.type('#siren4', siren.substring(4,5));
    await  page.type('#siren5', siren.substring(5,6));
    await  page.type('#siren6', siren.substring(6,7));
    await  page.type('#siren7', siren.substring(7,8));
    await  page.type('#siren8', siren.substring(8));

  // send
  const [response] = await Promise.all([
    page.waitForNavigation({
      timeout: TIMEOUT,
    }),
    page.$eval(formSelector, form => form.submit()),
  ]);

  // ok return 
  return { browser, page };

};
