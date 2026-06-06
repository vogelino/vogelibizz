import { N as NodeResponse } from "../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:https";
import "node:http2";
globalThis.Response = NodeResponse;
