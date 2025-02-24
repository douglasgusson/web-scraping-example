import * as cheerio from 'cheerio';

const fetchContent = async (url: string | URL) => {
  console.debug(url.toString());
  const response = await fetch(url);
  return await response.text();
}

const extractItems = ($: cheerio.CheerioAPI) => {
  const { items } = $.extract({
    items: [
      {
        selector: ".artifact-description",
        value: {
          title: {
            selector: ".artifact-title",
            value: (el) => $(el).text().trim(),
          },
          link: {
            selector: ".artifact-title > a",
            value: "href",
          },
          abstract: ".artifact-abstract",
          authors: [".artifact-info > .author span"],
          publisher: ".publisher-date > .publisher",
          date: ".publisher-date > .date",
        },
      },
    ],
  });

  return items;
}

const main = async () => {
  const url = new URL("https://repositorio.ifes.edu.br/recent-submissions");

  let offset: string | undefined;

  const now = new Date();
  const filePath = `./data/extracted-${now.toJSON()}.json`
  const file = Bun.file(filePath);
  const writer = file.writer();

  writer.write("[");

  do {
    const content = await fetchContent(url);
    const $ = cheerio.load(content, { baseURI: url.origin });

    offset = $(".next-page-link").attr("href")?.replace(/\D/g, '');

    const items = extractItems($);

    items.forEach((item, i) => {
      writer.write(JSON.stringify(item));
      const isLast = i === items.length - 1 && !offset;
      if (!isLast) writer.write(",");
    });

    if (offset) url.searchParams.set("offset", offset);

  } while (!!offset);

  writer.write("]");
  writer.end();
}

main()
