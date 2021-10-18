/** @format */

// /** @format */
import { ContextValue } from "@sqltools/types";
// import AbstractDriver from "@sqltools/base-driver";
// import { ViewColumn } from "vscode";

// interface IObjectCacheMember {
//   label: string;
//   parent?: string;
// }

// interface IObjectCache {
//   "connection.database": Array<IObjectCacheMember> | Array<null>;
//   "connection.table": Array<IObjectCacheMember> | Array<null>;
//   "connection.column": Array<IObjectCacheMember> | Array<null>;
// }

// interface ISearchHistory {
//   [key: string]: {
//     [key: string]: {
//       updated: Date;
//     };
//   };
// }

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

// export class ObjectCache {
//   private Cache: IObjectCache;
//   private SearchHistory: ISearchHistory;

//   constructor() {
//     this.reset();
//   }

//   public store = (data: Array<any>) => {
//     // With expansion syntax, second variable takes precident
//     const type = data[0].type;
//     data.forEach((dat) => {
//       this.Cache[type][dat.label] = {
//         type,
//         parent: dat.parent,
//         updated: new Date(),
//       };
//     });
//   };

//   public get: any = (type: ContextValue, search: string) => {
//     const splitSearch = search.split(".");
//     let found: Array<IObjectCacheMember>[] = [] as Array<IObjectCacheMember>[];
//     switch (splitSearch.length) {
//       case 1:
//         found = this.Cache[type].filter((elem) =>
//           elem.label.startsWith(search)
//         );
//         break;
//       case 2:
//         found = this.Cache[type].filter(
//           (elem) =>
//             elem.parent === splitSearch[0] &&
//             elem.label.startsWith(splitSearch[1])
//         );
//         break;
//     }
//     return found as Array<IObjectCacheMember>[];
//   };

//   public updateCache = async (itemType, search, queries, queryResults) => {
//     const searchTerms = splitSearch(itemType, search);
//     switch (itemType) {
//       case ContextValue.DATABASE:
//         return queryResults(queries.fetchDatabases);
//       case ContextValue.TABLE:
//         if (!!searchTerms["database"]) {
//           return queryResults(queries.searchTables);
//         }
//       case ContextValue.COLUMN:
//         if (!!searchTerms["columns"]) {
//           return queryResults(queries.fetchTableViews(searchTerms["column"]));
//         }
//     }
//   };

//   public find = (itemType, search, queries, queryResults) => {
//     const res = this.get(itemType, search);
//     if (res.length > 0) {
//       return res;
//     } else {
//     }
//   };

//   public reset = () => {
//     this.Cache = this._Cache;
//   };

//   private _Cache: IObjectCache = {
//     [ContextValue.DATABASE]: [],
//     [ContextValue.TABLE]: [],
//     [ContextValue.COLUMN]: [],
//   };
// }
