---
title: "Real-World Composable Error Handling in Reason"
date: 2019-12-21T11:53:00
slug: rwceh
tags: [Reason, "polymorphic variants", "error handling"]
excerpt: If you’ve ever considered handling errors in Reason or OCaml, chances are, you’ve happened upon Vladimir Keleshev’s article. Everybody links to it, so it seems like the way to handle errors. But how does it look in practice?
---

## The Question

If you’ve ever considered handling errors in Reason or OCaml, chances are, you’ve happened upon [Vladimir Keleshev’s article](http://keleshev.com/composable-error-handling-in-ocaml). Everybody links to it, so it seems like _the_ way to handle errors.

But how does it look in practice?

## The Experiment

Let’s try and write a simple `useFetch`, a custom [ReasonReact hook](https://reasonml.github.io/reason-react/docs/en/components#hooks) that wraps [bs-fetch](https://github.com/reasonml-community/bs-fetch). Then we’ll use another dependency, for decoding. And — the whole purpose for this experiment — we’ll try to compose their errors.

## Using bs-fetch

Let’s start with the basics:

```reason
// UseFetch.re

type fetchError = [ | `FetchError(Js.Promise.error)];

type t =
  | Fetching
  | Complete(Belt.Result.t(Js.Json.t, fetchError));

let useFetch = url => {
  let (state, setState) = React.useState(_ => Fetching);

  React.useEffect1(
    () => {
      Js.Promise.(
        Fetch.fetch(url)
        |> then_(Fetch.Response.json)
        |> then_(json => setState(_ => Complete(Ok(json))) |> resolve)
        |> catch(error =>
             `FetchError(error)
             |> (error => setState(_ => Complete(Error(error))) |> resolve)
           )
        |> ignore
      );

      None;
    },
    [|url|],
  );

  state;
};
```

First, let’s check if it works:

```reason
[@react.component]
let make = () => {
  let reposJson =
    UseFetch.useFetch(
      "https://api.github.com/search/repositories?q=language:reason&sort=stars&order=desc",
    );

  Js.log(reposJson);

  ReasonReact.string("Fetching...");
};
```

It does work, as in, it logs some JSON.

## bs-fetch Error

Now let’s talk about error handling. Note how `fetchError` has only one variant because bs-fetch uses `Js.Promise.error` for everything, and `Js.Promise.error` is [opaque by design](https://reasonml.chat/t/how-do-i-allow-consumers-of-promise-catch-the-errors/136/4). The thing is, you can technically throw anything in JS, not just an exception. If that worries you, run before it gets worse: the upcoming React [Suspense for Data Fetching in React](https://reactjs.org/docs/concurrent-mode-suspense.html) is officially supposed to throw promises [by way of algebraic effects](https://overreacted.io/algebraic-effects-for-the-rest-of-us/)).

So here’s one spanner in the works: opaque types in underlying libs. We sort of know that what bs-fetch happens to throw _are_ exceptions, so we could use [magic](https://bucklescript.github.io/docs/en/intro-to-external.html#special-identity-external) to convert `Js.Promise.error`, and then extract the message, but even if we _were_ to parse error messages, what good is that? Parsing messages is heuristic and, therefore, brittle, and using them raw is only any good for technical purposes, like logging, not for anything user-facing.

But speaking of logging, we didn’t fetch JSON just to dump it it to console. Let’s decode.

## Decoding

Of all the Reason json decoders I know, [decco](https://github.com/reasonml-labs/decco) is by far the most sugary, using ppx to create decoders from annotated type definitions. Here’s how it looks.

```reason
// GhRepo.re
[@decco]
type repo = {
  [@decco.key "full_name"]
  fullName: string,
  [@decco.key "html_url"]
  htmlUrl: string,
};
[@decco]
type t = {items: array(repo)};

// Decode.re
type decodeError = [ | `DecodeError(Decco.decodeError)];

// wrapping Decco.decodeError in a polymorphic variant
let mapDecodingError =
  fun
  | Ok(x) => Ok(x)
  | Error(e) => Error(`DecodeError(e));
```

`Decco.decodeError` is not as opaque: it’s defined as a record, holding path, error message, and JSON value. Still, to discern various errors, we’d have to resort to parsing messages just the same; let’s not.

To make composing with decoders easier, let’s also create a helper in the `UseFetch` module.

```reason
let mapOk = (t, f) =>
  switch (t) {
  | Fetching => Fetching
  | Complete(Ok(r)) => Complete(f(r))
  | Complete(Error(_)) as e => e
  };
```

`UseFetch.mapOk` is similar to `Result.flatMap`: the function parameter that it takes can return either `Ok(data)` or `Error(error)`—exactly the signature of Decco decoders.

All together now:

```reason
// App.re
[@react.component]
let make = () => {
  let repos =
    UseFetch.(
      useFetch(
        "https://api.github.com/search/repositories?q=language:reason&sort=stars&order=desc",
      )
      ->mapOk(r => GhRepo.t_decode(r)->Decode.mapDecodingError)
    );

  ReasonReact.string("Fetching...");
};
```

But lo, an error.

## A Decoding Error, or, Parametrizing UseFetch.mapOk

Immediately we get an error somewhere inside that `mapOk` call:

```
  This has type:
    result(Js.Array.t(GhRepo.t), ([> `DecodeError(Decco.decodeError) ] as 'a))
      (defined as Belt_Result.t(Js.Array.t(GhRepo.t), 'a))
  But somewhere wanted:
    Belt.Result.t(Js.Json.t, UseFetch.fetchError) (defined as
      Belt_Result.t(Js.Json.t, UseFetch.fetchError))

  The incompatible parts:
    Js.Array.t(GhRepo.t) (defined as array(GhRepo.t))
    vs
    Js.Json.t (defined as Js.Json.t)
```

I won’t pretend I understood this error right off the bat, but neither will I burden you with the story of my googling. The culprit is the way that `UseFetch.mapOk` is defined: our decoding process yields decoded data and a decoding error (typed as a superset of the same error), but `mapOk` expects strictly `Js.Json.t` and `fetchError`. So we need to parametrize both, and we start by parametrizing `UseFetch.t`.

```reason
type t('d, 'e) =
  | Fetching
  | Complete(result('d, [> fetchError] as 'e));
```

And luckily, that’s the only place you have to introduce type parameters. You don’t have to provide `'d` or `'e` when consuming those types, nor do you have to specify the `mapOk` signature, because OCaml/Reason type inference is pretty great. If you _had_ to provide the signature, it’d look like this:

```reason
let mapOk: 'a 'b 'e. (t('a, 'e), 'a => result('b, 'e)) => t('b, 'e) =
  (t, f) =>
    switch (t) {
    | Fetching => Fetching
    | Complete(Ok(r)) => Complete(f(r))
    | Complete(Error(_)) as e => e
    };
```

As you can see, there are two type parameters for data, `'a` & `'b`, because obviously, the mapping function can, and usually will, convert data from one type to another (e.g., from JSON to a record). But the error type stays the same because unifying an error type is precisely what we’re after. And again, let me remind you we don’t actually have to spell out the `mapOk` type.

Anyway, here we are, consuming the decoded result and the possible errors:

```reason
[@react.component]
let make = () => {
  UseFetch.(
    useFetch(
      "https://api.github.com/search/repositories?q=language:reason&sort=stars&order=desc",
    )
    ->mapOk(r => GhRepo.t_decode(r)->Decode.mapDecodingError)
    ->(
        fun
        | Fetching => ReasonReact.string("Fetching...")
        | Complete(Ok(({items}: GhRepo.t))) =>
          <ul>
            {Belt.Array.map(items, ({fullName, htmlUrl}: GhRepo.repo) =>
               <li key=fullName>
                 <a href=htmlUrl> {ReasonReact.string(fullName)} </a>
               </li>
             )
             ->React.array}
          </ul>
        | Complete(Error(`FetchError(_))) =>
          ReasonReact.string("Fetch error!")
        | Complete(Error(`DecodeError(_))) =>
          ReasonReact.string("Decode error!")
      )
  );
};
```

## Conclusion

So, all in all, composable error handling with real-world ReasonML libraries is quite possible, with a few caveats.

Firstly, out of 2 libs we’ve tried, neither used polymorphic variants, so we’ve taken their own (non-discernible) errors and wrapped them in our polymorphic variants. Not very granular, but then the consuming code didn’t have to branch over a whole lot of variants. I imagine having a few dozens possible variants would bring its inconveniences as well.

Secondly, to make polymorphic variants extensible, you’re going to have to parametrize a few things here and there. But OCaml type inference being seriously impressive, that problem is very manageable; at least, you don’t have to be verbose to solve it.

Is that all? Maybe that’s all. And ow, [here’s the repo](https://github.com/hoichi/rwceh) with the code.
