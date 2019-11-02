let reactElementFromArticle = (article: Post.t, tplFn) => {
  tplFn(article);
};

let htmlStringFromArticle = (article, tplFn) =>
  article->reactElementFromArticle(tplFn)->ReactDOMServerRe.renderToString;
