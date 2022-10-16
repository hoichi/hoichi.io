---
title: "TIL: Why ReasonML Has No Nullary Functions"
date: 2018-08-17
slug: why-no-nullary
excerpt: “If you don’t provide all of a function’s parameters, you get a new function from the remaining parameters to the result. As a consequence, if you could actually provide no parameters at all, then func() would be the same as func and neither would actually call func.”
tags: [ TIL, Reason, OCaml, Dr Axel]
---

> Why doesn’t ReasonML have nullary functions? That is due to ReasonML always performing partial application (explained in detail later): If you don’t provide all of a function’s parameters, you get a new function from the remaining parameters to the result. As a consequence, if you could actually provide no parameters at all, then func() would be the same as func and neither would actually call func.
> -- [Exploring ReasonML and functional programming](http://reasonmlhub.com/exploring-reasonml/ch_functions.html#there-are-no-functions-without-parameters) by Dr. Axel Rauschmayer
