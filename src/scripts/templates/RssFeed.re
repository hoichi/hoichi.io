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
  posts->Belt.Array.forEach(post =>
    feed##item({
      "title": post##title,
      "description": post##content,
      "url": siteUrl ++ "/blog/" ++ post##slug,
      "date": post##date,
    })
  );
  feed##xml();
};
