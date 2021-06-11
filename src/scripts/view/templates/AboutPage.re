module RR = ReasonReact;

[@react.component]
let make = (~siteTitle, ~pageTitle, ~category, ~content) => {
  <html>
    <HtmlHead title={siteTitle ++ " / " ++ pageTitle} />
    <body>
      <PageHeader title=pageTitle category />
      <PageContent content />
      <PageFooter humble=true />
    </body>
  </html>;
};
