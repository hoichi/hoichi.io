import * as fm from 'front-matter';
import * as markdownIt from 'markdown-it';

import { Page, SourceFile } from './model';
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

  const result = {
    // id is crucial
    id: path.full,
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

    // and here we override them with the yfm data
    // not too lazy, yes
    ...attributes,
  };

  return {
    ...result,
    // we need meta for constructPageUrl
    // fixme: it’s all hacky and brittle
    url: result['url'] || constructPageUrl({...page, ...result}),
  };
}

export { parsePage };
