import * as request from 'request';
import * as http from 'http';
import * as xml2js from 'xml2js';

type PromiseFn = (data: any) => void;

const META_NODE_NAME = '$';

function constructEncodedImage(
  mimetype: string | undefined = 'application/octet-stream',
  content: string
): string {
  return `data:${mimetype};base64,${content}`;
}

function getData(url: string): Promise<string> {
  return new Promise((resolve: PromiseFn, reject: PromiseFn): void => {
    const options = { encoding: 'base64', url };

    request(options, (
      err: Error | null,
      response: http.IncomingMessage,
      body: string
    ) => {
      if (err) { return reject(err); }

      // Per node docs, duplicate content-type headers are discarded
      // https://nodejs.org/api/http.html#http_message_headers
      const mimetype = (response.headers['content-type'] as string | undefined);
      resolve(constructEncodedImage(mimetype, body));
    });
  });
}

function parseAsync(str: string): Promise<object> {
  return new Promise((resolve: PromiseFn, reject: PromiseFn): void => {
    xml2js.parseString(str, (err: Error | null, result: object) => {
      if (err) { return reject(err); }
      return resolve(result);
    });
  });
}

interface NodeWithMetadata {
  '$': {
    [key: string]: string;
  };
}

interface NodeWithChildren {
  [nodeName: string]: SvgNode[];
}

type SvgNode = NodeWithChildren & NodeWithMetadata;

interface SvgDataRoot {
  svg: SvgNode;
}

// Modifies the object inline as it walks for convenience; we should add in a
// deep clone first if we ever want to do anything more clever.
async function walkTreeAndModify(
  nodeName: string,
  node: SvgNode
): Promise<SvgNode> {
  if (typeof node !== 'object') {
    return node;
  }

  const meta = node.$;

  if (nodeName === 'image' && meta['xlink:href']) {
    meta['xlink:href'] = await getData(meta['xlink:href']);
  }

  const childNodeNames = Object.keys(node);

  for (const childNodeName of childNodeNames) {
    if (childNodeName === META_NODE_NAME) { continue; }

    const childNodes: SvgNode[] = node[childNodeName];

    for (const childNode of childNodes) {
      await walkTreeAndModify(childNodeName, childNode);
    }
  }

  return node;
}

async function bundle(svgData: string): Promise<string> {
  if (!svgData) { return Promise.resolve(''); }
  const parsed = (await parseAsync(svgData) as SvgDataRoot);

  if (!parsed.svg) { return Promise.resolve(''); }

  const newSvg = await walkTreeAndModify('svg', parsed.svg);
  const newObject = { svg: newSvg };

  const builder = new xml2js.Builder();
  return builder.buildObject(newObject);
}

export default bundle;
