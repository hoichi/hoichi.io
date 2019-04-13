module RR = ReasonReact;
module U = Utils;

[@react.component]
let make = (~post) => {
  <html>
    <HtmlHead title={"i.i / " ++ post##title} />
    <body>
      <PageHeader title=post##title category=post##category />
      <main id="content" className="Content u-centered" role="main">
        <article>
          <aside className="b-Content__meta">
            <div className="b-Content__meta-date">
              {U.dateShort(post##date)->RR.string}
            </div>
            <div className="b-Content__meta-tags">
              {U.renderArray(post##tags, tag =>
                 <a
                   key={tag##slug}
                   className="b-post__tag"
                   href={"/tag/" ++ tag##slug}>
                   {RR.string("#" ++ tag##title)}
                 </a>
               )}
            </div>
          </aside>
          <div dangerouslySetInnerHTML={"__html": post##content} />
        </article>
      </main>
      <PageFooter />
    </body>
  </html>;
};
