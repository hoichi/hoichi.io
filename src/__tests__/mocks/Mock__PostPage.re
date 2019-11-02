module RR = ReasonReact;
module U = Utils;

[@react.component]
let make = (~article: Post.t) => {
  <>
    <header> <h1> {RR.string(article.title)} </h1> </header>
    <main id="content">
      <article>
        <aside>
          <div> {U.dateShort(article.meta.date)->RR.string} </div>
          <div>
            {U.renderList(article.meta.tags, tag =>
               <a key=tag href={"/tag/" ++ tag}> {RR.string("#" ++ tag)} </a>
             )}
          </div>
        </aside>
        {Markup.toReact(article.content)}
      </article>
    </main>
  </>;
};
