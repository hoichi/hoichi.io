let renderToElement = (type t, page: t, tpl: t => React.element) => {
  tpl(page);
};

let renderToHtmlString = (type t, page: t, tpl: t => React.element) =>
  renderToElement(page, tpl)->ReactDOMServerRe.renderToString;
