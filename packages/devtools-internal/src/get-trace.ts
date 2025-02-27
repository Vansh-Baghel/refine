import ErrorStackParser from "error-stack-parser";
import { cleanStack } from "./clean-stack";
import { isRefineStack } from "./is-refine-stack";
import { getPackageNameFromFilename } from "./get-package-name-from-filename";
import { TraceType } from "@refinedev/devtools-shared";

export function getTrace() {
  if (__DEV_CONDITION__ !== "development") {
    return [];
  } else {
    try {
      const error = new Error();
      const stack = ErrorStackParser.parse(error);
      const clean = cleanStack(stack);
      const traces = clean
        .map(
          (frame) =>
            ({
              file: frame.fileName,
              line: frame.lineNumber,
              column: frame.columnNumber,
              function: frame.functionName,
              isRefine: isRefineStack(frame.fileName),
              packageName: getPackageNameFromFilename(frame.fileName),
            }) as TraceType,
        )
        .filter((trace) => trace.function);
      return traces.slice(1);
    } catch (error) {
      return [];
    }
  }
}
