# svgbundler

A small tool that will track down any dependencies of an SVG image and embed
them inline.

Right now this just supports `<image>` tags — if they refer to external images,
it will fetch them and base64-inline them.

## Usage

```javscript
import bundler from 'svgbundler'; // or:
const bundler = require('svgbundler').default;

bundler('<svg>...etc...</svg>').then((result) => {
  // `result` is a string containing the newly bundled SVG
});

```

See `src/test.ts` for some examples of expected input/output.

## Motivation

An SVG image may contain raster images that are fetched over a network, just
like the `<img>` tag in HTML. However, for security reasons these are [blocked
by browsers](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image)
when the SVG content is not part of the page itself. Most non-browser tools that
work with SVGs also don't allow external images, so you'll need to bundle them
like this to e.g. preview them on your desktop, or open them in Sketch.

## Roadmap

- Support recursive SVGs, i.e. an SVG that refers to an SVG that refers to...etc
- Potentially support some `foreignObject` contents? TBD if there's anything
  useful there.
- Add timeouts and other sensible things
