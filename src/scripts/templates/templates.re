module RR = ReasonReact;

/*
  Template input props
 */

type siteProps = {
  .
  "domain": string,
  "title": string,
};

[@bs.deriving abstract]
type tplProps('page) = {
  page: 'page,
  site: siteProps,
};

let (>>) = (f, g, x) => x->f->g;

let componentToString = ReasonReact.element >> ReactDOMServerRe.renderToString;

module AboutPageWrapper = {
  type pageProps = {
    .
    "category": string,
    "content": string,
    "kind": string,
    "template": string,
    "title": string,
    "url": string,
  };

  let make: (~page: pageProps, ~site: siteProps) => string =
    (~page, ~site) =>
      AboutPage.make(
        ~siteTitle=site##title,
        ~pageTitle=page##title,
        ~category=page##category,
        ~content=page##content,
        [||],
      )
      ->componentToString;
};

module BlogFeedPageWrapper = {
  open Props;
  type pageProps = feedPageProps;

  let make = (~h1Prefix=?, ~page, ~site as _) => {
    /* hack: gotta be be a better way (and a better place) */
    let pageTitle =
      h1Prefix->Belt.Option.getWithDefault("") ++ page->titleGet;

    BlogFeedPage.make(
      ~description=page->contentGet,
      ~pageTitle,
      ~posts=page->postsGet,
      [||],
    )
    ->componentToString;
  };
};

module RssFeedWrapper = {
  open Props;
  type pageProps = feedPageProps;

  let siteUpdatedAt = Js.Date.(now()->fromFloat);

  let make = (~page, ~site) => {
    RssFeed.render(
      ~siteTitle=site##title,
      ~siteUrl="https://hoichi.io",
      ~siteAbout="You won’t believe what this developer didn’t know.",
      ~siteUpdatedAt,
      ~posts=page->postsGet,
      [||],
    );
  };
};

module PostPageWrapper = {
  type pageProps = Props.postProps;

  let make = (~page, ~site as _) => {
    PostPage.make(~post=page, [||])->componentToString;
  };
};

/*
  The templates dictionary
 */
let withTplProps = (make, props) =>
  make(~page=props->pageGet, ~site=props->siteGet);

[@bs.deriving abstract]
type make = {
  about: tplProps(AboutPageWrapper.pageProps) => string,
  blog: tplProps(BlogFeedPageWrapper.pageProps) => string,
  post: tplProps(PostPageWrapper.pageProps) => string,
  rss: tplProps(RssFeedWrapper.pageProps) => string,
  tag: tplProps(BlogFeedPageWrapper.pageProps) => string,
};

let templates =
  make(
    ~about=AboutPageWrapper.make->withTplProps,
    ~blog=BlogFeedPageWrapper.make(~h1Prefix="")->withTplProps,
    ~post=PostPageWrapper.make->withTplProps,
    ~rss=RssFeedWrapper.make->withTplProps,
    ~tag=BlogFeedPageWrapper.make(~h1Prefix="#")->withTplProps,
  );
