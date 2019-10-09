module RR = ReasonReact;
module U = Utils;

[@react.component]
let make = (~article: Article.t) => {
  <html>
    <head> <title> {RR.string(article.title)} </title> </head>
    <body>
      <header> <h1> {RR.string(article.title)} </h1> </header>
      <main id="content">
        <article>
          <aside>
            <div> {U.dateShort(article.meta.date)->RR.string} </div>
            <div>
              {U.renderArray(article.meta.tags, tag =>
                 <a key={tag##slug} href={"/tag/" ++ tag##slug}>
                   {RR.string("#" ++ tag##title)}
                 </a>
               )}
            </div>
          </aside>
          <div dangerouslySetInnerHTML={"__html": article.content} />
        </article>
      </main>
    </body>
  </html>;
};
