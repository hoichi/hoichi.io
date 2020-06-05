---
title: "be-good: Simple and Flexible Data Decoders for TypeScript"
date: 2020-06-04T11:53:00
slug: be-good-p1
tags: [TypeScript, "decoders"]
excerpt: This post is an introduction to both JSON decoders and my humble library of building blocks for them, called [`be-good`](https://github.com/hoichi/be-good).
---

## Intro

This post is an introduction to both JSON decoders and my humble library of building blocks for them, called [`be-good`](https://github.com/hoichi/be-good). Let’s start with the start.

## What Are Decoders And Why Do We Need Them

JSON decoders are well-known in static type languages like Elm or ReasonML (I think they predate both a bit). Static types are a great way to catch a great deal of bugs at the compile time. Which is definitely sweet when the alternative is catching those bugs in production, but even if we’re talking about preventing bugs, static types get some advantages over both unit tests (which we won’t discuss here, tempted that I am) and defensive programming, which is more verbose (and therefore obscures business logic and creates more places for bugs to hide) and has some runtime cost.

But of course, even the most sound type keeps you safe only if it controls the whole data lifecycle, cradle to grave. If the data comes from the outside world (say, across the network), what does the compiler know about that? If you just say this request returns data of type `{ status: Status, data: Data }` but instead you get `{ status: -1, error: {}}`, not only can your code break in runtime, but it can also bring down your whole app _exactly because_ you thought you didn’t need no stinking defensive programming no more and now your code has no immunity.

Sure, there are situations where you can trust your types for external data, e.g., whey you generate them from a Swagger or a GraphQL schema. If you have something like that, and your devops is sound, you probably don’t need decoders—congrats, godspeed, best regards.

But maybe you don’t have that luxury. Maybe you have a lot of legacy backend, maybe it’s some tool developed by a single intern with no notion of what REST is, maybe it’s some third-party API: lots of reasons why you might have zero say in the matters of the API tooling, so typegen is out of the question.

This is exactly where the decoders come in. A decoder is a function that takes some external data that could in theory be anything, and checks if it really is of the type it’s supposed to be.