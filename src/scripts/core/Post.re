type t = {
  id,
  title: string,
  content: Markup.t,
  excerpt: Markup.t,
  meta,
}
and meta = {
  date: Js.Date.t,
  published: bool,
  slug: string,
  tags: list(string),
}
and id = string;
