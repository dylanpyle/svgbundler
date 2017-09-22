import bundle from './index';

/* tslint:disable:max-line-length */
/* tslint:disable:no-console */
/* tslint:disable:object-literal-sort-keys */

// Probably will want to swap these out for something a bit more stable in future
const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/52/Spacer.gif' ;
const encodedImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAIBRAA7';

interface TestCase {
  title: string;
  input: string;
  expectedOutput: string;
}

const TEST_CASES: TestCase[] = [
  {
    title: 'SVGs without images are not bundled',
    input: '<svg width="200" height="200"><rect height="100" width="100" /></svg>',
    expectedOutput: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg width="200" height="200">
  <rect height="100" width="100"/>
</svg>`
  },

  {
    title: 'SVGs with one image are bundled',
    input: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg width="200" height="200">
  <image width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${imageUrl}" />
</svg>`,
    expectedOutput: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg width="200" height="200">
  <image width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${encodedImage}"/>
</svg>`
  },

  {
    title: 'SVGs with multiple images are bundled',
    input: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg width="200" height="200">
  <g>
    <rect width="100" />
    <g>
      <image width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${imageUrl}"/>
    </g>
    <image width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${imageUrl}"/>
  </g>
</svg>`,
    expectedOutput: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg width="200" height="200">
  <g>
    <rect width="100"/>
    <g>
      <image width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${encodedImage}"/>
    </g>
    <image width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${encodedImage}"/>
  </g>
</svg>`
  }
];

async function test(): Promise<void> {
  for (const testCase of TEST_CASES) {
    console.log('');
    const actualOutput: string = await bundle(testCase.input);

    if (actualOutput === testCase.expectedOutput) {
      console.log(`✅  Passed: ${testCase.title}`);
    } else {
      console.log(`❌  Failed: ${testCase.title}\n`);
      console.log(`Expected:\n\n${testCase.expectedOutput}\n`);
      console.log(`Actual:\n\n${actualOutput}\n`);
    }
  }
}

test().catch(() => { console.log('Exiting'); });
