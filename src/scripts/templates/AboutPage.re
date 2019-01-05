module RR = ReasonReact;

let component = RR.statelessComponent("AboutPage");

let make = (~siteTitle, ~pageTitle, ~category, ~content, _children) => {
  ...component,
  render: _self =>
    <html>
      <HtmlHead title={siteTitle ++ " / " ++ pageTitle} />
      <body>
        <PageHeader title=pageTitle category />
        <PageContent content />
        <PageFooter />
      </body>
    </html>,
};
