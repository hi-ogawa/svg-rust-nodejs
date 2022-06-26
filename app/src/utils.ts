import { sortBy } from "lodash";
import path from "path";
import os from "os";
import crypto from "crypto";

export function sortKeys(value: object): object {
  return Object.fromEntries(sortBy(Object.entries(value), ([k, _v]) => k));
}

export function getTemporaryFile(): string {
  return path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"));
}
