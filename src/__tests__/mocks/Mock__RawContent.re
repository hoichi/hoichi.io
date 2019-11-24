let noFm = "# H1\n\nWho needs the fm anyway.\n"->SourceFile.RawContent;

let coupleProps =
  {|---
foo: FOO
bar: BAR
---

Here comes the content
|}
  ->SourceFile.RawContent;

let fullMeta =
  {|---
date: '2019-06-01T20:38:01.155Z'
exerpt: Upon the sign the challengers with shrieks and cries rush forth
published: true
tags: [foo, bar]
title: The Sentinel
---

Along deserted avenues
The steam begins to rise
|}
  ->SourceFile.RawContent;
