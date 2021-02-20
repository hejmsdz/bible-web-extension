const BOOKS = {
  'Rdz': 'Księga Rodzaju',
  'Wj': 'Księga Wyjścia',
  'Kpł': 'Księga Kapłańska',
  'Lb': 'Księga Liczb',
  'Pwt': 'Księga Powtórzonego Prawa',
  'Joz': 'Księga Jozuego',
  'Sdz': 'Księga Sędziów',
  'Rt': 'Księga Rut',
  '1Sm': 'Pierwsza Księga Samuela',
  '2Sm': 'Druga Księga Samuela',
  '1Krl': 'Pierwsza Księga Królewska',
  '2Krl': 'Druga Księga Królewska',
  '1Krn': 'Pierwsza Księga Kronik',
  '2Krn': 'Druga Księga Kronik',
  'Ezd': 'Księga Ezdrasza',
  'Ne': 'Księga Nehemiasza',
  'Tb': 'Księga Tobiasza',
  'Jdt': 'Księga Judyty',
  'Est': 'Księga Estery',
  '1Mch': 'Pierwsza Księga Machabejska',
  '2Mch': 'Druga Księga Machabejska',
  'Hi': 'Księga Hioba',
  'Ps': 'Księga Psalmów',
  'Prz': 'Księga Przysłów',
  'Koh': 'Księga Koheleta',
  'Pnp': 'Pieśn nad Pieśniami',
  'Mdr': 'Księga Mądrości',
  'Syr': 'Księga Syracydesa',
  'Iz': 'Księga Izajasza',
  'Jr': 'Księga Jeremiasza',
  'Lm': 'Księga Lamentacji',
  'Ba': 'Księga Barucha',
  'Ez': 'Księga Ezechiela',
  'Dn': 'Księga Daniela',
  'Oz': 'Księga Ozeasza',
  'Jl': 'Księga Joela',
  'Am': 'Księga Amosa',
  'Ab': 'Księga Abidiasza',
  'Jon': 'Księga Jonasza',
  'Mi': 'Księga Micheasza',
  'Na': 'Księga Nahuma',
  'Ha': 'Księga Habakuka',
  'So': 'Księga Sofoniasza',
  'Ag': 'Księga Aggeusza',
  'Za': 'Księga Zachariasza',
  'Ml': 'Księga Malachiasza',

  'Mt': 'Ewangelia wg św. Mateusza',
  'Mk': 'Ewangelia wg św. Marka',
  'Łk': 'Ewangelia wg św. Łukasza',
  'J': 'Ewangelia wg św. Jana',
  'Rz': 'List do Rzymian',
  '1Kor': 'Pierwszy List do Koryntian',
  '2Kor': 'Drugi List do Koryntian',
  'Ga': 'List do Galatów',
  'Ef': 'List do Efezjan',
  'Flp': 'List do Filipian',
  'Kol': 'List do Kolosan',
  '1Tes': 'Pierwszy List do Tesaloniczan',
  '2Tes': 'Drugi List do Tesaloniczan',
  '1Tm': 'Pierwszy List do Tymoteusza',
  '2Tm': 'Drugi List do Tymoteusza',
  'Tt': 'List do Tytusa',
  'Flm': 'List do Filemona',
  'Hbr': 'List do Hebrajczyków',
  'Jk': 'List św. Jakuba',
  '1P': 'Pierwszy List św. Piotra',
  '2P': 'Drugi List św. Piotra',
  '1J': 'Pierwszy List św. Jana',
  '2J': 'Drugi List św. Jana',
  '3J': 'Trzeci List św. Jana',
  'Ap': 'Apokalipsa św. Jana',
};

if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
  browser = chrome;
}

const formatBook = (book) => {
  const [ordinal, initial, rest] = (book.toLowerCase().match(/(\d?)\s?([a-z])([a-z]*)/) || []).slice(1);
  return `${ordinal}${initial.toUpperCase()}${rest}`;
};

const ensureValidVerseRange = (verses) => {
  if (!verses.includes('-')) {
    return verses;
  }

  const [fromVerse, toVerse] = verses.split('-').map(Number);
  if (toVerse > fromVerse) {
    return verses;
  }
  return `${fromVerse}`;
};

const parseBibleQuery = (query) => {
  const [book, chapter, verses] = (query.match(/((?:[1-3]\s?)?[A-Za-z]+)(?:\s)?(\d+)?(?:[,:]\s?(\d+(?:-\d+)?))?/) || []).slice(1);

  return {
    book: book && formatBook(book),
    chapter,
    verses: verses && ensureValidVerseRange(verses),
  };
};

const paulistsUrl = (book, chapter, verses) => {
  const chapterUrl = `https://pismoswiete.pl/app/#/tome/${book}/chapter/${chapter}/`;
  if (!verses) {
    return chapterUrl;
  }

  return `${chapterUrl}${verses}?isVerseQuery=true`;
};

const formatBookName = (book) => BOOKS[book];

const formatBookChapter = (book, chapter) => book === 'Ps' ? `Psalm ${chapter}` : `${BOOKS[book]}, rozdział ${chapter}`;

const formatVerses = (verses) => verses.includes('-') ? `wersety ${verses}` : `werset ${verses}`;

const getSuggestions = (query) => {
  const queryLower = query.toLowerCase();
  const { book, chapter, verses } = parseBibleQuery(query);

  if (!chapter && !query.endsWith(' ')) {
    return Object.entries(BOOKS)
      .filter(([symbol, name]) => symbol.startsWith(book) || name.toLowerCase().includes(queryLower))
      .map(([symbol, name]) => ({
        content: `${symbol} `,
        description: name,
        isSymbolMatch: symbol.startsWith(book),
      }));
  }
  if (!verses) {
    if (chapter) {
      return [{ content: `${book} ${chapter}, `, description: formatBookChapter(book, chapter) }];
    }
    return [{ content: `${book} `, description: formatBookName(book) }];
  }
  return [{
    content: `${book} ${chapter}, ${verses}`,
    description: `${formatBookChapter(book, chapter)}, ${formatVerses(verses)}`,
  }];
};

const compareSuggestions = (a, b) => {
  if (a.isSymbolMatch !== b.isSymbolMatch) {
    return (b.isSymbolMatch || 0) - (a.isSymbolMatch || 0);
  }
  return a.content.localeCompare(b.content);
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

browser.omnibox.setDefaultSuggestion({ description: 'Pismo Święte' });

browser.omnibox.onInputChanged.addListener((query, suggest) => {
  const suggestions = getSuggestions(query).sort(compareSuggestions);
  suggest(suggestions);
});

browser.omnibox.onInputEntered.addListener((query, disposition) => {
  const { book, chapter, verses } = parseBibleQuery(query);
  if (!book) {
    return;
  }

  const url = paulistsUrl(book, chapter || '1', verses);
  openPage(disposition, url);
});

