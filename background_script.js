const formatBook = (book) => {
  return book
    .replace(' ', '')
    .replace(/[a-z]/, (letter) => letter.toUpperCase());  
};

const parseBibleQuery = (query) => {
  const [book, chapter, verses] = (query.match(/((?:[1-3]\s?)?[A-Za-z]+) (\d+)(?:[,:]\s?(\d+(?:-\d+)?))?/) || []).slice(1);

  return {
    book: formatBook(book),
    chapter,
    verses,
  };
};

const paulistsUrl = ({ book, chapter, verses }) => {
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

  const url = paulistsUrl({ book, chapter, verses });
  openPage(disposition, url);
});

