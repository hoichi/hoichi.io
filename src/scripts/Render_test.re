open Jest;
open Expect;
open ReactTestingLibrary;

module AnyOld = Mock.AnyOld;

let mockPost = (~id, ~date, ~title, ~excerpt, ~tags, ~content) =>
  Post.{
    id,
    meta: {
      ...AnyOld.meta,
      date: Js.Date.fromString(date),
      tags,
    },
    title,
    content: Markup.Markdown(content),
    excerpt: Markup.Markdown(excerpt),
  };

describe("Render a single post", () =>
  test("", _ =>
    mockPost(
      ~id="x/y/z.md",
      ~date="2019-06-01",
      ~title="Hello code!",
      ~excerpt="Are there other languages besides JavaScript?",
      ~tags=["hello", "world"],
      ~content=
        {|
What do you mean, other languages?

```js
console.log(0.1 + 0.2);
```|},
    )
    |> Render.renderToElement(_, post => <Mock__PostTpl post />)
    |> render
    |> expect
    |> toMatchSnapshot
  )
);

/*
 describe("Render a blog feed", () =>
   {}
 );
 */
