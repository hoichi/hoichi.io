import * as jade from 'jade';
import { pipe } from 'ramda';

import { Stream } from '@most/types';
import { map, runEffects, tap } from '@most/core';
import { newDefaultScheduler } from '@most/scheduler';

import { SourceFile, SiteMeta } from './model';

type RenderFn = Function; // todo

interface Template {
  id: string;
  render: RenderFn;
}

type TplDic = Record<string, RenderFn>;

interface TplCfg {
  default: string;
  [k: string]: any; // todo
}

async function compileTemplates(sources: Stream<SourceFile>) {
  const tplDic: TplDic = {};

  const templates = pipe(
    map(compileTemplate),
    tap(tpl => (tplDic[tpl.id] = tpl.render)),  )(sources);

  await runEffects(templates, newDefaultScheduler());

  return tplDic;
}

const renderPage = (dic: TplDic, cfg: TplCfg, site?: SiteMeta) => page => {
  const renderFn = dic[page.template || cfg.default] || dic[cfg.default];

  return {
    ...page,
    content: renderFn({ cfg, page, site }), // todo: de-hardcode meta structure?
  };
};

function compileTemplate({ path, rawContent }: SourceFile): Template {
  return {
    id: path.name,
    render: jade.compile(rawContent, {
      pretty: '\t',
      filename: path.full,
    }),
  };
}

export { compileTemplates, renderPage };
