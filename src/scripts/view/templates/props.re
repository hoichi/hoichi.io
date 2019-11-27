type tagProps = {
  .
  "slug": string,
  "title": string,
};

/* fixme: no JS here */
type postProps = {
  .
  "id": string,
  "category": string,
  "content": string,
  "date": Js.Date.t,
  "excerpt": string,
  "kind": string,
  "slug": string,
  "tags": array(tagProps),
  "template": string,
  "title": string,
  "url": string,
};

[@bs.deriving abstract]
type feedPageProps = {
  title: string,
  content: string,
  posts: array(postProps),
};
