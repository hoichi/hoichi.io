module RR = ReasonReact;
module U = Utils;

[@react.component]
let make = (~post: Post.t) => {
  <>
    <header> <h1> {RR.string(post.title)} </h1> </header>
    <main id="content">
      <article>
        <aside>
          <div> {U.dateShort(post.meta.date)->RR.string} </div>
          <div>
            {U.renderList(post.meta.tags, tag =>
               <a key=tag href={"/tag/" ++ tag}> {RR.string("#" ++ tag)} </a>
             )}
          </div>
        </aside>
        {Markup.toReact(post.content)}
      </article>
    </main>
  </>;
};
