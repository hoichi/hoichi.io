module RR = ReasonReact;
module U = Utils;

[@react.component]
let make = (~posts: array(Post.t), ~category: string) => {
  <>
    <header> <h1> {RR.string(category)} </h1> </header>
    <main id="content">
      {posts->U.renderArray(post =>
         <article key={post.id}>
           <h2> {RR.string(post.title)} </h2>
           <div> {U.dateShort(post.meta.date)->RR.string} </div>
           <div>
             {U.renderList(post.meta.tags, tag =>
                <a key=tag href={"/tag/" ++ tag}> {RR.string("#" ++ tag)} </a>
              )}
           </div>
           {Markup.toReact(post.excerpt)}
         </article>
       )}
    </main>
  </>;
};
