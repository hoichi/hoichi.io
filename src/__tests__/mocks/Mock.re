module PostPage = Mock__PostPage;

module AnyOld = {
  let meta: Post.meta = {
    date: Js.Date.fromString("2019-06-01T20:38:01.155Z"),
    published: true,
    tags: ["hello", "world"],
  };

  let source =
    SourceFile.{
      path: {
        dir: "",
        ext: "",
        name: "",
        dirs: [],
        full: "",
      },
      rawContent: SourceFile.RawContent("Who cares"),
    };
};
