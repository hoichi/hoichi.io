module RR = ReasonReact;
module U = Utils;

let component = RR.statelessComponent("BlogFeedPage");

let make = (~pageTitle, ~posts, ~description=?, _children) => {
  ...component,
  render: _self => {
    <html>
      <HtmlHead title={"i.i / " ++ pageTitle} />
      <body>
        <PageHeader title=pageTitle />
        <main id="content" className="Content u-centered" role="main">
          {switch (description) {
           | Some(desc) =>
             <p className="b-desc" dangerouslySetInnerHTML={"__html": desc} />
           | _ => RR.null
           }}
          {U.renderArray(posts, post =>
             <div key={post##id} className="b-post">
               <header className="b-post__header">
                 <span className="b-post__date">
                   {U.dateShort(post##date)->RR.string}
                 </span>
                 {RR.string(" " /* /o */)}
                 <h2 className="b-post__title">
                   <a className="b-post__header-link" href={"/" ++ post##url}>
                     {RR.string(post##title)}
                   </a>
                 </h2>
               </header>
               <div className="b-post__body">
                 <a
                   className="b-post__more"
                   href={"/" ++ post##url}
                   dangerouslySetInnerHTML={"__html": post##excerpt}
                 />
               </div>
               <div className="b-post__meta">
                 {U.renderArray(post##tags, tag =>
                    <a
                      key={tag##slug}
                      className="b-post__tag"
                      href={"/tag/" ++ tag##slug}>
                      {RR.string(tag##title)}
                    </a>
                  )}
               </div>
             </div>
           )}
        </main>
        <PageFooter />
      </body>
    </html>;
  },
};
