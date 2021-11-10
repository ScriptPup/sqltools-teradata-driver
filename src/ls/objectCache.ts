/** @format */

// /** @format */
import { ContextValue } from "@sqltools/types";
import TeraDriver from "./driver";
// import AbstractDriver from "@sqltools/base-driver";
// import { ViewColumn } from "vscode";

interface IObjectCacheMember {
  label: string;
  parent?: string;
}

interface IObjectCache {
  "connection.database": Array<IObjectCacheMember> | Array<null>;
  "connection.table": Array<IObjectCacheMember> | Array<null>;
  "connection.column": Array<IObjectCacheMember> | Array<null>;
}

export const splitSearch = (type, search) => {
  const split = search.split(".");
  const searchResults = {};
  switch (type) {
    case ContextValue.DATABASE:
      searchResults["database"] = search;
      break;
    case ContextValue.TABLE:
      if (split.length === 1) {
        searchResults["table"] = search;
      } else {
        searchResults["database"] = split[0];
        searchResults["table"] = split[1];
      }
      break;
    case ContextValue.COLUMN:
      if (split.length === 1) {
        searchResults["column"] = search;
      } else {
        searchResults["column"] = split[1];
      }
      break;
  }
  return searchResults;
};

// TODO: Implement a cache
// I think this would actually be better to do in the base driver
// instead of doing it on each individual driver
// so I want to check on that in the core driver first

export class ObjectCache {
  private Cache: IObjectCache;
  private Status: "READY" | "LOADING" | "ERROR";
  private driver: TeraDriver;
  private queryResults;

  constructor({ driver, queryResults }) {
    this.driver = driver;
    this.queryResults = queryResults;
    this.reset();
  }

  public find = async ({ itemType, search, ...extraParams }) => {
    const res = this.get(itemType, search);
    if (res.length > 0) {
      console.debug(">> CACHE Results found in cache");
      return Promise.resolve(res);
    } else {
      if (this.Status === "LOADING") {
        return Promise.resolve([]);
      }
      console.debug(">> CACHE find: starting cache update");
      const res2 = await this.updateCache({ itemType, search, extraParams });
      console.debug(">> CACHE find: finished cache update and returning", res2);
      return res2;
    }
  };

  private store = (data: Array<any>) => {
    // With expansion syntax, second variable takes precident
    console.log("Trying to update store", data);
    const type = data[0].type;
    const self = this;
    data.forEach((dat) => {
      self.Cache[type].push({
        ...dat,
        updated: new Date(),
      });
    });
  };

  private get: any = (type: ContextValue, search: string) => {
    const splitSearch = search.split(".");
    // console.log(`>>CACHE SEARCH: looking for ${type}, ${search}`);
    // console.log(`       ${JSON.stringify(splitSearch)}`);
    let found: Array<IObjectCacheMember>[] = [] as Array<IObjectCacheMember>[];
    switch (splitSearch.length) {
      case 1:
        found = this.Cache[type].filter((elem) =>
          elem.label.startsWith(search)
        );
        if (type === ContextValue.TABLE) {
          found = found.concat(
            this.Cache[ContextValue.DATABASE].filter((elem) =>
              elem.label.startsWith(search)
            )
          );
        }
        break;
      case 2:
        found = this.Cache[type].filter(
          (elem) =>
            elem.parent === splitSearch[0] &&
            elem.label.startsWith(splitSearch[1])
        );
        break;
    }
    return found as Array<IObjectCacheMember>[];
  };

  private query = async ({
    itemType,
    search,
    extraParams = {},
  }: {
    itemType: string;
    search: string;
    extraParams: any;
  }) => {
    const queries = this.driver.queries;
    const searchTerms = splitSearch(itemType, search);
    switch (itemType) {
      case ContextValue.DATABASE:
        console.debug(">>CACHE query: Updating database list");
        return this.queryResults(queries.fetchDatabases, {});
      case ContextValue.TABLE:
        if (!!searchTerms["database"]) {
          console.debug(
            `>>CACHE query: Updating table list for search term ${search}`
          );
          try {
            const res = this.queryResults(queries.searchTables({ search }));
            res.catch((e) => {
              console.error(">>CACHE query: Failed to update table catch");
              console.error(e);
              throw e;
            });
            return res;
          } catch (e) {
            console.error(">>CACHE query: Failed to update table cache");
            console.error(e);
            throw e;
          }
        }
      case ContextValue.COLUMN:
        console.log("Search terms", searchTerms);
        if (!!searchTerms["column"]) {
          console.debug(
            `CACHE>> Updating column list for search term ${search} on tables ${extraParams.tables}`
          );
          try {
            const res = this.queryResults(
              queries.searchColumns({ search, ...extraParams })
            );
            res.catch((e) => {
              console.error(">>CACHE query: Failed to update column catch");
              console.error(e);
              throw e;
            });
            return res;
          } catch (e) {
            console.error(">>CACHE query: Failed to update column cache");
            console.error(e);
            throw e;
          }
        }
    }
  };

  private updateCache = async ({
    itemType,
    search,
    extraParams,
  }: {
    itemType: string;
    search: string;
    extraParams: any;
  }) => {
    const self = this;

    return await self.withTimeout(
      (this.driver.connection as any).itimeout,
      [],
      async () => {
        try {
          const updt = await self.query({ itemType, search, ...extraParams });
          if (!updt) {
            console.debug(">>CACHE update: Nothing found");
            return null;
          }
          self.store(updt);
          return Promise.resolve(updt);
        } catch (e) {
          console.error(">>CACHE update: Failed to update cache.", e);
        }
      }
    );
  };

  public reset = () => {
    this.Cache = this._Cache;
  };

  private getState = (): "READY" | "LOADING" | "ERROR" => {
    return this.Status;
  };

  private setState = (state: "READY" | "LOADING" | "ERROR") => {
    this.Status = state;
  };

  private withTimeout = async (timeout, default_return, func) => {
    const waitFor = (timeout, cancelBit) => {
      return new Promise((resolve, reject) => () => {
        cancelBit.cancel = () => {
          console.debug(">>CACHE timer:: Timer canceled");
          resolve(true);
        };
        setTimeout(() => {
          console.debug(">>CACHE timer:: Timed out");
          reject();
        }, timeout);
      });
    };
    const self = this;
    self.setState("LOADING");
    const cancelBit = { cancel: () => {}, canceled: false };
    const waitfor = waitFor(timeout, cancelBit);
    // Call the function, and if/when it completes, cancel the timeout
    const res = func();
    res.then(() => {
      self.setState("READY");
      try {
        console.debug(">>CACHE timeouter: No timeout needed, canceling timer");
        cancelBit.cancel();
        // console.debug(
        //   ">>CACHE timeouter: timer canceled, returning results",
        //   r
        // );
      } catch (e) {
        console.error("Failed to utitilize timeout", e);
      }
    });
    console.debug(">>CACHE timeouter: Starting timeout wait");
    waitfor
      .then(() => {
        console.debug(">>CACHE timeouter: Finished waiting");
        if (self.getState() === "READY") {
          console.debug(">>CACHE timeouter: Data is ready, returning it", res);
          return res;
        }
      })
      .catch(() => {
        console.debug(">>CACHE timeouter: Cache query timed out");
        return Promise.resolve(default_return);
      });
    // await waitfor.catch((error) => console.error("Timeout failed", error));
  };

  private _Cache: IObjectCache = {
    [ContextValue.DATABASE]: [],
    [ContextValue.TABLE]: [],
    [ContextValue.COLUMN]: [],
  };
}
