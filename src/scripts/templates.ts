import { SiteMeta } from './model';

type RenderFn = Function; // todo

type TplDic = Record<string, RenderFn>;

interface TplCfg {
  default: string;
  [k: string]: any; // todo
}

function getTemplates() {
  return require('../src/scripts/templates/templates.bs.js').templates;
}

const renderPage = (dic: TplDic, cfg: TplCfg, site?: SiteMeta) => page => {
  const renderFn = dic[page.template || cfg.default];

  return {
    ...page,
    content: renderFn({ cfg, page, site }), // todo: de-hardcode meta structure?
  };
};
export { getTemplates, renderPage };
