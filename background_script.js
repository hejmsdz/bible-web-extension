const parseBibleQuery = (query) => {
  const [book, chapter, verses] = (query.match(/((?:[1-3]\s?)?[A-Za-z]+) (\d+)(?:[,:]\s?(\d+(?:-\d+)?))?/) || []).slice(1);
  const bookCapitalized = book[0].toUpperCase() + book.slice(1);

  return {
    book: bookCapitalized,
    chapter,
    verses,
  };
};

const pismoSwietePl = ({ book, chapter, verses }) => {
  const chapterUrl = `https://pismoswiete.pl/app/#/tome/${book}/chapter/${chapter}/`;
  if (!verses) {
    return chapterUrl;
  }

  return `${chapterUrl}${verses}?isVerseQuery=true`;
};

const openPage = (disposition, url) => {
  switch (disposition) {
    case 'currentTab':
      browser.tabs.update({ url });
      break;
    case 'newForegroundTab':
      browser.tabs.create({ url });
      break;
    case 'newBackgroundTab':
      browser.tabs.create({ url, active: false });
      break;
  }
};

browser.omnibox.onInputEntered.addListener((query, disposition) => {
  const { book, chapter, verses } = parseBibleQuery(query);
  if (!book && !chapter) {
    return;
  }

  const url = pismoSwietePl({ book, chapter, verses });
  openPage(disposition, url);
});

