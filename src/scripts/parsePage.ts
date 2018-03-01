import * as fm from 'front-matter';
import * as markdownIt from 'markdown-it';

import { Page, SourceFile } from './model/page';
import { extract1stHtmlParagraph, constructPageUrl } from './utils';

const md = markdownIt({
  breaks: true,
  html: true,
  typographer: true,
  quotes: '«»„“',
});

function parsePage(page: SourceFile): Page {
  const { path, rawContent } = page;

  const { body = rawContent, attributes = {} } = fm(rawContent);

  const content = md.render(body);

  return {
    // here’s some defaults
    title: 'Untitled',
    date: new Date(),
    //
    published: true,
    category: path.dir || '',
    tags: [],
    //
    content,
    excerpt: extract1stHtmlParagraph(content),
    //
    url: constructPageUrl(page),

    // and here we override them with the yfm data
    // not too lazy, yes
    ...attributes,
  };
}

export { parsePage };
