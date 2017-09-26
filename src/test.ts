import bundle from './index';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

/* tslint:disable:max-line-length */
/* tslint:disable:no-console */
/* tslint:disable:object-literal-sort-keys */

// Probably will want to swap these out for something a bit more stable in future
const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/52/Spacer.gif' ;
const httpImageUrl = imageUrl.replace(/https/, 'http');
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
    <image width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${encodedImage}"/>
  </g>
</svg>`
  },

  {
    title: 'Empty SVGs are handled',
    input: '',
    expectedOutput: ''
  },

  {
    title: 'SVGs with no elements are handled',
    input: '<svg>Oh, hey there!</svg>',
    expectedOutput: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg>Oh, hey there!</svg>`
  },

  {
    title: 'SVGs with HTTP images are bundled',
    input: `<svg>
  <image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${httpImageUrl}" />
</svg>`,
    expectedOutput: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg>
  <image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${encodedImage}"/>
</svg>`
  }
];

async function test(): Promise<void> {
  for (const testCase of TEST_CASES) {
    process.stdout.write(`${testCase.title}...`);

    const actualOutput: string = await bundle(testCase.input);

    if (actualOutput === testCase.expectedOutput) {
      console.log(COLORS.green, 'Passed', COLORS.reset);
    } else {
      console.log(COLORS.red, 'Failed');
      console.log(`Expected:\n\n${testCase.expectedOutput}\n`);
      console.log(`Actual:\n\n${actualOutput}\n`, COLORS.reset);
    }
  }
}

test().catch((err: Error) => {
  console.log(COLORS.red, err, COLORS.reset);
  console.log(COLORS.red, 'Exiting due to error', COLORS.reset);
});
