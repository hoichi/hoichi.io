module RR = ReasonReact;

[@react.component]
let make = (~title) => {
  <head>
    <meta httpEquiv="x-ua-compatible" content="ie=edge" />
    <title> {RR.string(title)} </title>
    <meta
      name="description"
      content="I write as I learn as I go. A blog on web development,
	  technologies involved and problems solved."
    />
    <meta name="viewport" content="width=device-width initial-scale=1" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="alternate" type_="application/rss+xml" href="/feed.xml" />
    <script src="/js/vendor/modernizr-2.8.3.min.js" />
  </head>;
};
