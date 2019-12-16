type feedOptions = {
  .
  "title": string,
  "description": string,
  "site_url": string,
  "feed_url": string,
  "language": string,
  "pubDate": Js.Date.t,
};
type itemOptions = {
  .
  "title": string,
  "description": string,
  "url": string,
  "date": Js.Date.t,
};

let postedFirstBecause = [|
  {js|, because home sweet home.|js},
  {js|, because you can’t be too paranoid.|js},
  {js|, but you’re welcome to read it anywhere.|js},
  {js|. Not that it matters.|js},
  {js|. DIY FTW!|js},
  {js|, narcissist that I am.|js},
|];

class type _rssClass =
  [@bs]
  {
    pub item: itemOptions => unit;
    pub xml: unit => string;
  };
type rssClass = Js.t(_rssClass);

[@bs.new] [@bs.module] external rss: feedOptions => rssClass = "rss";

let render =
    (~siteTitle, ~siteUrl, ~siteAbout, ~siteUpdatedAt, ~posts, _children) => {
  let feed: rssClass =
    rss({
      "title": siteTitle,
      "description": siteAbout,
      "site_url": siteUrl,
      "feed_url": siteUrl ++ "/feed",
      "language": "en-US",
      "pubDate": siteUpdatedAt,
    });
  posts->Belt.Array.forEach(post => {
    let becauseIdx =
      Js.Math.random_int(0, postedFirstBecause->Js.Array2.length);
    let postedFirstDisclaimer =
      "\n<hr />\n<p>Posted first at "
      ++ "<a href=\"https://hoichi.io\">hoichi.io</a>"
      ++ postedFirstBecause[becauseIdx]
      ++ "</p>";

    feed##item({
      "title": post##title,
      "description": post##content ++ postedFirstDisclaimer,
      "url": siteUrl ++ "/blog/" ++ post##slug,
      "date": post##date,
    });
  });
  feed##xml();
};
