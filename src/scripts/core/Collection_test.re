open Jest;
open Expect;

/*
   Mocks and helpers
 */
module AnyOld = Mock.AnyOld;

let postWithDate = ((fullPath, dateStr)) =>
  Post.{
    meta: {
      ...AnyOld.meta,
      date: Js.Date.fromString(dateStr),
    },
    title: "",
    content: Markup.Markdown(""),
    excerpt: Markup.Markdown(""),
    source: {
      ...AnyOld.source,
      path: {
        ...AnyOld.source.path,
        full: fullPath,
      },
    },
  };

let postsArray = Belt.Array.map(_, postWithDate);
let addPosts = (c: Collection.t, posts) =>
  postsArray(posts)->Belt.Array.reduce(c, Collection.add);

/*
   Tests
 */
test("an empty collection", () =>
  expect(Collection.make()->Collection.toArray) |> toEqual([||])
);

test("single value", () =>
  expect(
    Collection.(
      make()
      ->addPosts([|("foo/bar.md", "2019-06-01T20:38:01.155Z")|])
      ->toArray
    ),
  )
  |> toEqual(postsArray([|("foo/bar.md", "2019-06-01T20:38:01.155Z")|]))
);

test("several unsorted values", () =>
  expect(
    Collection.(
      make()
      ->addPosts([|
          ("a/x.md", "2019-09-01"),
          ("a/y.md", "2019-07-01"),
          ("a/z.md", "2019-05-02"),
        |])
      ->toArray
    ),
  )
  |> toEqual(
       postsArray([|
         ("a/z.md", "2019-05-02"),
         ("a/y.md", "2019-07-01"),
         ("a/x.md", "2019-09-01"),
       |]),
     )
);
