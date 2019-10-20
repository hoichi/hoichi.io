module Remark = {
  type processor;
  type plugin;
  type syntaxTree;

  /*
   todo: paramertize both plugin and processor so `process` can emit
   something other than string
   */

  [@bs.module] external remark: unit => processor = "remark";
  [@bs.send] external use: (processor, plugin) => processor = "use";
  [@bs.send] external parse: (processor, string) => syntaxTree = "parse";
  [@bs.send]
  external stringify: (processor, syntaxTree) => string = "stringify";
  /*
     [@bs.send]
     external processSync: (processor, string) => string = "processSync";
   */

  [@bs.module] external remarkHtml: plugin = "remark-html";

  let processor = remark()->use(remarkHtml);

  let toHtml = s => {
    let st = processor->parse(s);
    processor->stringify(st);
  };
};

let reactElementFromArticle = (article: Article.t, tplFn) => {
  let content = Markup.toString(article.content)->Remark.toHtml;

  tplFn({...article, content: Markup.Markdown(content)});
};

let htmlStringFromArticle = (article, tplFn) =>
  article->reactElementFromArticle(tplFn)->ReactDOMServerRe.renderToString;
