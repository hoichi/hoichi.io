import * as fs from 'fs';
import * as path from 'path';
import * as mkpath from 'mkpath';

import { runEffects, tap } from '@most/core';
import { newDefaultScheduler } from '@most/scheduler';
import { Stream } from '@most/types';

import { Page } from './model/page';

// todo: more generic pages (all we need is content & some path/slug info)

function write(dir: string, pages: Stream<Page>) {
  console.log(`write()`);

  runEffects(
    tap(page => writeToFile(path.resolve(dir, page.url), page.content), pages),
    newDefaultScheduler(),
  ).then(() => console.log('Aaand written.'));

  // q: should write be effective immediately?
}

function writeToFile(destPath: string, content: string): void {
  if (!/.+\.\w+$/i.test(destPath)) {
    destPath = path.resolve(destPath, 'index.html');
  }

  try {
    tryWritingOnce();
  } catch (err) {
    if (err.message.includes('ENOENT')) {
      mkpath.sync(path.dirname(destPath));
      tryWritingOnce();
    } else {
      throw err;
    }
  }

  function tryWritingOnce(): void {
    /*
    It’s sync so we don’t try to write to the file we’re writing to already.
    (No idea if it works, maybe I need better safeguards. Or none at all.)
  */
    fs.writeFileSync(destPath, content, { encoding: 'UTF-8' });
  }
}

export { write };
