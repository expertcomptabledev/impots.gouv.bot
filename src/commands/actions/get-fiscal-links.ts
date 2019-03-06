declare var document;

export const getFiscalLinks = async page => {
  if (!page) {
    throw new Error('Need fiscal page to extract links');
  } else {
    // get all links in racin tree
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#racine a'))
        .map((node: any) => node.href)
        .filter(function(item, pos, self) {
          return self.indexOf(item) == pos;
        });
    });
    return links;
  }
};
