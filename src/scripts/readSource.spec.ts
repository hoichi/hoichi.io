import * as mock from 'mock-fs';
import test from 'ava';

import {observeSource} from './readSource';

mock({
    'path/to/fake/dir': {
        'some-file.md': 'some file content here',
        'other-file-content.md': 'some file content here',
        'empty-dir': {/** empty directory */}
    },
    'path/to/some.png': new Buffer([8, 6, 7, 5, 3, 0, 9]),
    'some/other/path': {/** another empty directory */}
});

test(async t => {
    observeSource('path/to/**/*.md', {});
});

mock.restore();