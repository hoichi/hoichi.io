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

test("Render a single post", _ =>
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
);

test("Render a blog feed", _ =>
  Collection.(
    make()
    ->add(
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
        ),
      )
    ->add(
        mockPost(
          ~id="a/b/c.md",
          ~date="2019-07-01",
          ~title="A Month Without Lunches!",
          ~excerpt="I wasn’t that hungry anyway",
          ~tags=["learning", "lunches"],
          ~content=
            "Wat’s better than lunches? According to Manning, almost anything.",
        ),
      )
    ->add(
        mockPost(
          ~id="k/l/m.md",
          ~date="2019-05-01",
          ~title="Had me before hello",
          ~excerpt="We were destined for each other, World",
          ~tags=["hello", "impending"],
          ~content=
            "I didn’t choose the world, but the world probably didn’t ask for me either.",
        ),
      )
    ->add(
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
console.log(0.1 + 0.2); // 0.30000000000000004
```|},
        ),
      )
    ->toArray
  )
  |> Render.renderToElement(_, posts =>
       <Mock__FeedTpl posts category="blog" />
     )
  |> render
  |> expect
  |> toMatchSnapshot
);
