module RR = ReasonReact;

let component = RR.statelessComponent("HtmlHead");

/* underscores before names indicate unused variables. We name them for clarity */
let make = (~title, _children) => {
  ...component,
  render: _self =>
    <head>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <title> {RR.string(title)} </title>
      <meta
        name="description"
        content="I write as I learn as I go. A blog on web development,
      technologies involved and problems solved."
      />
      <meta name="viewport" content="width=device-width initial-scale=1" />
      <link rel="stylesheet" href="/css/style.css" />
      <link rel="alternate" type_="application/rss+xml" href="/feed.xml" />
      <script src="/js/vendor/modernizr-2.8.3.min.js" />
    </head>,
  /*<meta charset="utf-8" />*/
};
