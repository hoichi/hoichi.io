---
title: "How Not to Introduce ReasonReact to Your Project"
date: 2019-01-19T11:53:00
slug: how-not-to-reason-react
tags: [ Reason, ReasonReact, frontend ]
---

Well, _actually_ the reality is not as harsh as the clickbaitey title would make you think. Nothing particularly wrong came out of my introduction of ReasonReact and, by extension, ReasonML to the static build of this very site. The claim that you can introduce Reason & ReasonReact to an existing application one component at a time is entirely true.

 Moreover, ReasonML is pretty sweet, and BuckleScript is the bestest, fastest, most optimizing -to-JS compiler I know of.

It’s just that my particular implementation was just a little bit inefficient and probably not a good management decision. If I could go back in time, I’d do it differently—or maybe wouldn’t do at all in the foreseeable future.

That disclaimer aside, let me start from the start.

## What Is Wrong With TypeScript

The reason I was eyeing a language like ReasonML is that TypeScript seems a tad suboptimal for me (and a little boring). It’s still wordy, all the ESNext advances notwithstanding. You can emulate both sum types and exhaustive cases in it, but they look somewhat monstrous. Its types give you way fewer guarantees than, say, types in ML languages. And don’t get me started on FP patterns in JS: `pipe(foo, bar, baz)(x)` reads infinitely less natural than `x |> foo |> bar |> baz`.

Probably as important as the guarantees, it feels like the TypeScript types allow you a little too much. Extending object types, for one. Yes, `Object.assign()` is totally a thing in JavaScript that those types are modeling. Yes, often it does feel convenient to go and add some more properties to an existing object.

It also leads to lazy thinking. Take my static site build scripts. They have:

- Pages (posts) as I read them off a file system, with path information and raw content data
- Same, with YAML frontmatter extracted and markdown parsed to HTML
- Same, put into lists for blog feed, tag feeds, and RSS
- Both individual pages and feed pages, wrapped in the appropriate page/post layout

The types for all of the above are way under-designed because every single time I thought: Nah, I’ll just copy the old object with some extra prop, and maybe override the `content` property, nevermind it’s now HTML instead of Markdown. Yes, I know that with proper discipline you can sit down and think those specs through, but discipline is depletable, so you tend to wing it—and then waste time setting breakpoints and logging stuff.

So I hoped that OCaml’s restrictive records would nudge me towards designing with types.

There was also some nice-to-haves, like maybe processing more data with the Reason standard library in a more concise way, or maybe turning my blog into semi-SPA with ReasonReact. Not that the page load speed is a problem I have with a Netlify-hosted static site.

## Why, Then, Have I Started With Templating

But all of a sudden I’ve decided that I need to introduce comments. _And_ maybe a new theme. _And_ all of it to improve the chances of getting a better job. For that, one felt, the lack of ReasonReact was a showstopper. For if I were to use it later at all, doing work on my current Jade templates felt a little wasteful.

So, instead of solving an interesting problem of designing with types, I’ve found myself doing something closer to a chore. Also, was I sure it was necessary? Do I have actual plans to evolve the client part of my blog? All for fear of not finding a good job? Is blogging on random tech bits something I want more than just hacking or learning stuff?

Lousy management, like I said. False urgency over importance.

## So, How It Went?

Well, it went ok. I had to resort to a little hack because the BuckleScript compiler has fewer options regarding input/output dirs. I also had to use the `rss` package, because React’s idea of how you use the `link` tag is not compatible with how it is used in RSS (which is not HTML, of course, but try telling it to React). But then maybe my feed is now more standard-compliant for it, and converting some random Atom example to Jade was a worse hack, to begin with.

However, the whole result is also mildly useless. The scheme is now like this: I’ve got a `templates.re` file that returns a dictionary of template functions to be consumed in JS-land. So, it uses JS interop to:

- construct the dictionary itself
- wrap the individual templates and convert the JS param objects to ML labeled parameters
- also, for templates that get arrays of posts and tags, get individual props off those posts and tags, because I’ve got too lazy to convert those objects to proper ML records

So, the bulk of my work went into the interop that I’m going to have to throw away when (or if) I convert everything to Reason/OCaml. Mind you, BuckleScript JS interop is pretty terrific, and ReasonML sugar for it is great too, But the process is just a bit tedious and doesn’t feel like making something important, especially since it’s all makeshift.

Conversely, there isn’t a whole lot of ML to ML API: the wrappers pass ML params to the templates, and those pass them on to the ReasonReact components. Not that many types to help me grok my state management, or yell at me if I do something wrong.

## Summary?

All in all, I did add a few smallish ReasonReact components to a TypeScript module, and they work. As far as learning projects go, it went well. What I’ve learned wasn’t particularly fundamental,  but then you can’t do much practical stuff without some non-fundamental knowledge. The bane of project-based learning, I guess.

 Next time, though, I’m going to think twice whether it’s worth it, and where that new technology is going to have the most impact. Using Reason or OCaml for the build logic itself would take longer, but might bring more clarity. Converting everything would take even longer, but would free me from having to write that interop code—or rather, I’d have to write it for some other modules, like [@most/core](https://mostcore.readthedocs.io/en/latest/).Provided I’d managed to debug the whole thing at once.

 Especially since I have minimal experience with tests. Maybe I should write more of those in 2019.
