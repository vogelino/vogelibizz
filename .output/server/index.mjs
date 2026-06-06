globalThis.__nitro_main__ = import.meta.url;
import { N as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { d as defineHandler, H as HTTPError, t as toEventHandler, a as defineLazyEventHandler, b as H3Core, c as HTTPResponse } from "./_libs/h3.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import "node:http";
import "node:stream";
import "node:https";
import "node:http2";
import "./_libs/rou3.mjs";
function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled;
  const status = error.status || 500;
  const url = event.url || new URL(event.req.url);
  if (status === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.req.method}] ${url}
`, error);
  }
  const headers2 = {
    "content-type": "application/json",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  if (status === 404 || !event.res.headers.has("cache-control")) {
    headers2["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    status,
    statusText: error.statusText,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status,
    statusText: error.statusText,
    headers: headers2,
    body
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key2, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key2, value);
  }
});
const assets = {
  "/fonts/IBMPlexMono-Regular.ttf": {
    "type": "font/ttf",
    "etag": '"26124-CE3quoPrLXDxlThu5s7/ecksqVQ"',
    "mtime": "2026-02-09T20:07:26.184Z",
    "size": 155940,
    "path": "../public/fonts/IBMPlexMono-Regular.ttf"
  },
  "/fonts/Inter-Bold.ttf": {
    "type": "font/ttf",
    "etag": '"66a4c-lGHnwIMTfCq+bRmPeE+w00GlJ6E"',
    "mtime": "2026-02-09T20:07:26.183Z",
    "size": 420428,
    "path": "../public/fonts/Inter-Bold.ttf"
  },
  "/assets/___vite-browser-external_commonjs-proxy-DZ4-2_GT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"196-+DQd17wvi+csMBe3BkHNbhfdGgk"',
    "mtime": "2026-02-09T20:07:26.091Z",
    "size": 406,
    "path": "../public/assets/___vite-browser-external_commonjs-proxy-DZ4-2_GT.js"
  },
  "/assets/_id-BiTWJuAu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28a-YM+K8T7bSx51Acx1kOvWGVNjvJU"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 650,
    "path": "../public/assets/_id-BiTWJuAu.js"
  },
  "/assets/_id-BtWYdj5N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"299-t6AOcLPuOJkqg3nPrrSLorbgUZ8"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 665,
    "path": "../public/assets/_id-BtWYdj5N.js"
  },
  "/fonts/Inter-BoldItalic.ttf": {
    "type": "font/ttf",
    "etag": '"67d50-+nbMcQmcteKynIjbiwnq5vwujiI"',
    "mtime": "2026-02-09T20:07:26.183Z",
    "size": 425296,
    "path": "../public/fonts/Inter-BoldItalic.ttf"
  },
  "/assets/_id-NQfCmOh9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"294-73zgIcX540HJVhf0URxuy3uMX98"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 660,
    "path": "../public/assets/_id-NQfCmOh9.js"
  },
  "/assets/auth-B4tN4pV9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"43e-rCbAoCuSnqaRaLigUyu4YupiwJA"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 1086,
    "path": "../public/assets/auth-B4tN4pV9.js"
  },
  "/assets/clients-CVb8Ghni.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"94-vf5D+b+yJpyBdmpdsSg1ffTTmB8"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 148,
    "path": "../public/assets/clients-CVb8Ghni.js"
  },
  "/assets/_resource-BCCcAZLl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"91aa-darFoM/VwJhQ+xQZm6tnroLe4qU"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 37290,
    "path": "../public/assets/_resource-BCCcAZLl.js"
  },
  "/assets/create-Cp0uKgx5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1fa-LkkjfdoATGh95vpTGhjJyy61ZZM"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 506,
    "path": "../public/assets/create-Cp0uKgx5.js"
  },
  "/fonts/Inter-Italic.ttf": {
    "type": "font/ttf",
    "etag": '"65e6c-CxQcUlAV12f3FDEGtKQk/SgvunE"',
    "mtime": "2026-02-09T20:07:26.183Z",
    "size": 417388,
    "path": "../public/fonts/Inter-Italic.ttf"
  },
  "/assets/create-DBe_2cXU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"200-PeaS/gdoOLgNKdmWYX+LFcKzcZU"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 512,
    "path": "../public/assets/create-DBe_2cXU.js"
  },
  "/assets/create-D_1kHqyi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"200-HrxHSorWjtK1EKBGdYhOb2pFYDs"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 512,
    "path": "../public/assets/create-D_1kHqyi.js"
  },
  "/assets/db.client-CHyAP33m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"185-pLNY6rDw3ig4VNiwBGHsmENsKwc"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 389,
    "path": "../public/assets/db.client-CHyAP33m.js"
  },
  "/assets/expenses-ByRUSSTt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95-0P5FV6mIN9eJeNSBKDelB8d/TBY"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 149,
    "path": "../public/assets/expenses-ByRUSSTt.js"
  },
  "/assets/getClient-BLgEbdsD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"21b-cs7p7UffA7JN9s3sQUOrj9PFHa0"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 539,
    "path": "../public/assets/getClient-BLgEbdsD.js"
  },
  "/fonts/Inter-Regular.ttf": {
    "type": "font/ttf",
    "etag": '"647f8-bjQw+QaktCtLY/2PM+SYpD2fjYQ"',
    "mtime": "2026-02-09T20:07:26.183Z",
    "size": 411640,
    "path": "../public/fonts/Inter-Regular.ttf"
  },
  "/assets/getExpense-CDOYbUBT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c39-b64JmlQsAPl532BPc+LKm4/ZrJM"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 3129,
    "path": "../public/assets/getExpense-CDOYbUBT.js"
  },
  "/assets/getProject-BYEoXA-t.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"222-oNLA84mIAot+yiInSBrMo6jW4tU"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 546,
    "path": "../public/assets/getProject-BYEoXA-t.js"
  },
  "/assets/global-CXjBAQnq.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"f261-yWjTWJytbNtidYKKWOJL0fhXx6E"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 62049,
    "path": "../public/assets/global-CXjBAQnq.css"
  },
  "/assets/index-Bj05-G1R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4a-GpaQBqPNxoZ+LBtxfBYg9bOnlos"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 74,
    "path": "../public/assets/index-Bj05-G1R.js"
  },
  "/assets/index-CmZDP-UH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4a-H1gsaODkheYnCu3beUZYzvowszI"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 74,
    "path": "../public/assets/index-CmZDP-UH.js"
  },
  "/assets/index-BcY-yFyN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24770-40HtdRU0IH/Xh7gXe9vmFdXbF2o"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 149360,
    "path": "../public/assets/index-BcY-yFyN.js"
  },
  "/assets/index-DEvWeuv0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bf-eC1flSZSg4fdpHxCflIGIctr/FM"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 191,
    "path": "../public/assets/index-DEvWeuv0.js"
  },
  "/assets/index-DSG1qBFx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4a-Xh+brxw6tnJ1nVicYXapHrL+aX4"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 74,
    "path": "../public/assets/index-DSG1qBFx.js"
  },
  "/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2": {
    "type": "font/woff2",
    "etag": '"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0"',
    "mtime": "2026-02-09T20:07:26.089Z",
    "size": 25960,
    "path": "../public/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2"
  },
  "/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2": {
    "type": "font/woff2",
    "etag": '"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 18748,
    "path": "../public/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2"
  },
  "/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2": {
    "type": "font/woff2",
    "etag": '"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8"',
    "mtime": "2026-02-09T20:07:26.089Z",
    "size": 11232,
    "path": "../public/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2"
  },
  "/assets/inter-greek-wght-normal-CkhJZR-_.woff2": {
    "type": "font/woff2",
    "etag": '"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 18996,
    "path": "../public/assets/inter-greek-wght-normal-CkhJZR-_.woff2"
  },
  "/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2": {
    "type": "font/woff2",
    "etag": '"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M"',
    "mtime": "2026-02-09T20:07:26.089Z",
    "size": 10252,
    "path": "../public/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2"
  },
  "/assets/login-BjjPPHPb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"333-ioNn1yu6E3vwLuPPiTKunOs4A60"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 819,
    "path": "../public/assets/login-BjjPPHPb.js"
  },
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2": {
    "type": "font/woff2",
    "etag": '"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 85068,
    "path": "../public/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2"
  },
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2": {
    "type": "font/woff2",
    "etag": '"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 48256,
    "path": "../public/assets/inter-latin-wght-normal-Dx4kXJAl.woff2"
  },
  "/assets/modal-B2kWFkMw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"303-Hs25yja86+XKqhcxEVtrzmog0jY"',
    "mtime": "2026-02-09T20:07:26.091Z",
    "size": 771,
    "path": "../public/assets/modal-B2kWFkMw.js"
  },
  "/assets/modal-BrfbXzO0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"263-xF+4sNVNBNMQkX/kmn3CnLP/YtA"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 611,
    "path": "../public/assets/modal-BrfbXzO0.js"
  },
  "/assets/modal-DaW4fx9p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"263-ks75t4Q01QtldxHvhKOEKQM0Wxk"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 611,
    "path": "../public/assets/modal-DaW4fx9p.js"
  },
  "/assets/modal-DjNnCt2n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"25e-wtjW/S6CsVhTwS0ng4O878IYBt4"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 606,
    "path": "../public/assets/modal-DjNnCt2n.js"
  },
  "/assets/modal-DqXD4nez.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"308-F8cz//GTeUtK4v/mUzmReLDtBqY"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 776,
    "path": "../public/assets/modal-DqXD4nez.js"
  },
  "/assets/modal-DsXygTiN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"310-sQEUjIoJ1hF+8mOol4NqSfv7frU"',
    "mtime": "2026-02-09T20:07:26.091Z",
    "size": 784,
    "path": "../public/assets/modal-DsXygTiN.js"
  },
  "/assets/projects-GK82kFUS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"95-CWkVqMhsb6mgY4S+QqAC3L+b5LM"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 149,
    "path": "../public/assets/projects-GK82kFUS.js"
  },
  "/assets/save-Dr5rCgD4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"147-6EHfOCwHhTnkydhqzkIHHgCs8Dw"',
    "mtime": "2026-02-09T20:07:26.091Z",
    "size": 327,
    "path": "../public/assets/save-Dr5rCgD4.js"
  },
  "/assets/text-editor-f6XCk8i9.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"2d01-hZtygRVDxaoHUjzeDkZkHzabpcU"',
    "mtime": "2026-02-09T20:07:26.090Z",
    "size": 11521,
    "path": "../public/assets/text-editor-f6XCk8i9.css"
  },
  "/assets/text-editor-DSIvvxhE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"516f9-dp69wBVx94Xw6n2Tb2s3fewG8C8"',
    "mtime": "2026-02-09T20:07:26.091Z",
    "size": 333561,
    "path": "../public/assets/text-editor-DSIvvxhE.js"
  },
  "/assets/main-RrpTWHDA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fcb64-aMQ28RAyanTmokvHZexXGQgebOM"',
    "mtime": "2026-02-09T20:07:26.091Z",
    "size": 1035108,
    "path": "../public/assets/main-RrpTWHDA.js"
  },
  "/assets/pdf-C-gaCZqY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"21f68c-FCfAKppWzj9JZySnosHUTfx6CHs"',
    "mtime": "2026-02-09T20:07:26.091Z",
    "size": 2225804,
    "path": "../public/assets/pdf-C-gaCZqY.js"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br",
  zstd: ".zst"
};
const _ZXXpxy = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/");
    s.length - 1;
    if (s[1] === "assets") {
      r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
    }
    return r;
  };
})();
const _lazy_Qe2j19 = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return rendererTemplate;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_Qe2j19 };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_ZXXpxy)
].filter(Boolean);
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function createNitroApp() {
  const hooks = void 0;
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({
          error,
          context: errorCtx
        });
      }
    }
  };
  const h3App = createH3App({ onError(error, event) {
    return errorHandler(error, event);
  } });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  const app = {
    fetch: appHandler,
    h3: h3App,
    hooks,
    captureError
  };
  return app;
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  {
    h3App["~getMiddleware"] = (event, route) => {
      const pathname = event.url.pathname;
      const method = event.req.method;
      const middleware = [];
      {
        const routeRules = getRouteRules(method, pathname);
        event.context.routeRules = routeRules?.routeRules;
        if (routeRules?.routeRuleMiddleware.length) {
          middleware.push(...routeRules.routeRuleMiddleware);
        }
      }
      middleware.push(...h3App["~middleware"]);
      if (route?.data?.middleware?.length) {
        middleware.push(...route.data.middleware);
      }
      return middleware;
    };
  }
  return h3App;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  for (const rule of Object.values(routeRules)) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
  process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
  process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: nitroApp.fetch
});
trapUnhandledErrors();
const nodeServer = {};
const rendererTemplate$1 = () => new HTTPResponse('<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="UTF-8" />\n		<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n	</head>\n	<body>\n		<div id="root"></div>\n		<script type="module" src="/src/client.tsx"><\/script>\n	</body>\n</html>\n', { headers: { "content-type": "text/html; charset=utf-8" } });
function renderIndexHTML(event) {
  return rendererTemplate$1(event.req);
}
const rendererTemplate = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: renderIndexHTML
});
export {
  nodeServer as default
};
