import { IQueryKeys } from "src/interfaces";
import { QueryKey } from "@tanstack/react-query";

import { MetaQuery } from "src/interfaces";
import { pickNotDeprecated } from "../pickNotDeprecated";
import { keys as newKeys } from "../keys";

/**
 * @deprecated `queryKeys` is deprecated. Please use `keys` instead.
 */
export const queryKeys = (
  resource?: string,
  dataProviderName?: string,
  meta?: MetaQuery,
  /**
   * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
   */
  metaData?: MetaQuery | undefined,
): IQueryKeys => {
  const providerName = dataProviderName || "default";
  const keys: IQueryKeys = {
    all: [providerName],
    resourceAll: [providerName, resource || ""],
    list: (config) => [
      ...keys.resourceAll,
      "list",
      {
        ...config,
        ...(pickNotDeprecated(meta, metaData) || {}),
      } as QueryKey,
    ],
    many: (ids) =>
      [
        ...keys.resourceAll,
        "getMany",
        (ids && ids.map(String)) as QueryKey,
        { ...(pickNotDeprecated(meta, metaData) || {}) } as QueryKey,
      ].filter((item) => item !== undefined),
    detail: (id) => [
      ...keys.resourceAll,
      "detail",
      id?.toString(),
      { ...(pickNotDeprecated(meta, metaData) || {}) } as QueryKey,
    ],
    logList: (meta) =>
      ["logList", resource, meta as any, metaData as QueryKey].filter(
        (item) => item !== undefined,
      ),
  };
  return keys;
};

export const queryKeysReplacement = (preferLegacyKeys?: boolean) => {
  return (
    resource?: string,
    dataProviderName?: string,
    meta?: MetaQuery,
    /**
     * @deprecated `metaData` is deprecated with refine@4, refine will pass `meta` instead, however, we still support `metaData` for backward compatibility.
     */
    metaData?: MetaQuery | undefined,
  ): IQueryKeys => {
    const providerName = dataProviderName || "default";

    const keys: IQueryKeys = {
      all: newKeys().data(providerName).get(preferLegacyKeys),
      resourceAll: newKeys()
        .data(dataProviderName)
        .resource(resource ?? "")
        .get(preferLegacyKeys),
      list: (config) =>
        newKeys()
          .data(dataProviderName)
          .resource(resource ?? "")
          .action("list")
          .params({
            ...config,
            ...(pickNotDeprecated(meta, metaData) || {}),
          })
          .get(preferLegacyKeys),
      many: (ids) =>
        newKeys()
          .data(dataProviderName)
          .resource(resource ?? "")
          .action("many")
          .ids(...(ids ?? []))
          .params({
            ...(pickNotDeprecated(meta, metaData) || {}),
          })
          .get(preferLegacyKeys),
      detail: (id) =>
        newKeys()
          .data(dataProviderName)
          .resource(resource ?? "")
          .action("one")
          .id(id ?? "")
          .params({
            ...(pickNotDeprecated(meta, metaData) || {}),
          })
          .get(preferLegacyKeys),
      logList: (meta) =>
        [
          ...newKeys()
            .audit()
            .resource(resource)
            .action("list")
            .params(meta)
            .get(preferLegacyKeys),
          metaData as QueryKey,
        ].filter((item) => item !== undefined),
    };

    return keys;
  };
};
