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

  let make: (~page: pageProps, ~site: siteProps) => RR.reactElement =
    (~page, ~site) =>
      <AboutPage
        siteTitle=site##title
        pageTitle=page##title
        category=page##category
        content=page##content
      />;
};

module BlogFeedPageWrapper = {
  open Props;
  type pageProps = feedPageProps;

  let make = (~h1Prefix=?, ~page, ~site as _) =>
    <BlogFeedPage
      description={page->contentGet}
      pageTitle={h1Prefix->Belt.Option.getWithDefault("") ++ page->titleGet}
      posts={page->postsGet}
    />;
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

  let make = (~page, ~site as _) => <PostPage post=page />;
};

/*
  The templates dictionary
 */
let wrapStringTpl = (make, props) =>
  make(~page=props->pageGet, ~site=props->siteGet);

let wrapReactTpl = (make, props) =>
  make(~page=props->pageGet, ~site=props->siteGet)
  ->ReactDOMServerRe.renderToString;

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
    ~about=AboutPageWrapper.make->wrapReactTpl,
    ~blog=BlogFeedPageWrapper.make(~h1Prefix="")->wrapReactTpl,
    ~post=PostPageWrapper.make->wrapReactTpl,
    ~rss=RssFeedWrapper.make->wrapStringTpl,
    ~tag=BlogFeedPageWrapper.make(~h1Prefix="#")->wrapReactTpl,
  );
