/** @format */

import { IBaseQueries, ContextValue } from "@sqltools/types";
import queryFactory from "@sqltools/base-driver/dist/lib/factory";
import { helper_ColTypeCASE } from "./cases";
import { splitSearch } from "./objectCache";

/** write your queries here go fetch desired data. This queries are just examples copied from SQLite driver */

const fetchDatabases: IBaseQueries["fetchDatabases"] = queryFactory`
  SELECT 
    DatabaseName AS "label"
    ,DatabaseName as "name"
    ,DatabaseName AS "database"
    ,'${ContextValue.DATABASE}' AS "type"
    ,'database' AS "detail"
    ,'database' AS "iconId"
  FROM DBC.DBase
  WHERE 
    RowType = 'D'
    AND OwnerName = 'DBC' --"Root" level databases only, don't pull nested DBs here
  ;
`;

const fetchChildDatabases: IBaseQueries["fetchChildDatabases"] = queryFactory`
  SELECT 
    DatabaseName AS "label"
    ,DatabaseName as "name"
    ,DatabaseName AS "database"
    ,'${ContextValue.DATABASE}' AS "type"
    ,'database' AS "detail"
    ,'database' AS "iconId"
    FROM DBC.DBase
  WHERE 
  RowType = 'D'
  AND OwnerName = '${(p: any) =>
    p.label}' -- Only get children of the selected parent
  AND OwnerName <> 'DBC' -- Do not include "top" level databases
`;

const describeTable: IBaseQueries["describeTable"] = queryFactory`
  HELP TABLE '${(p) => p.label}';
`;

// NOTE > Getting PK value for TD requires joining to indexes table
//      The additional join may cause performance issues in large deployments
//      leaving it out for now.
const fetchColumns: IBaseQueries["fetchColumns"] = queryFactory`
SELECT 
  c.ColumnName as "label"
  ,${helper_ColTypeCASE} AS "dataType"
  ,C.Nullable AS "isNullable"
  ,NULL AS "isPk" 
  ,'${ContextValue.COLUMN}' as "type"
FROM dbc.columnsV AS C 
WHERE tablename = '${(p) => p.label}'
ORDER BY ColumnId ASC;
`;

const fetchRecords: IBaseQueries["fetchRecords"] = queryFactory`
SELECT TOP ${(p) => p.limit || 50}
*
FROM ${(p) => p.table.label || p.table};
`;

const countRecords: IBaseQueries["countRecords"] = queryFactory`
SELECT count(1) AS total
FROM ${(p) => p.table.label || p.table};
`;

const fetchTablesAndViews = (
  type: ContextValue,
  tableType = "T"
): IBaseQueries["fetchTables"] => queryFactory`
SELECT 
  TableName AS "label"
  ,DataBaseName AS "parent"
  ,'${type}' AS "type"
FROM dbc.tablesV
WHERE 
  TableKind = '${tableType}'
  AND DataBaseName = '${(p) => p.database}'
;
`;

const fetchTables: IBaseQueries["fetchTables"] = fetchTablesAndViews(
  ContextValue.TABLE
);
const fetchViews: IBaseQueries["fetchTables"] = fetchTablesAndViews(
  ContextValue.VIEW,
  "V"
);

const searchTables: IBaseQueries["searchTables"] = queryFactory`
SELECT 
  TableName AS "label"
  ,DataBaseName AS "parent"
FROM dbc.tablesV
WHERE 
  TableKind IN ('T','V')
  AND DataBaseName = '${(p) =>
    splitSearch(ContextValue.TABLE, p.search)["database"]}'
;
${(p) => {
  console.log(p);
  return "";
}}
`;
// const searchTables: IBaseQueries["searchTables"] = queryFactory`
// SELECT
//   TableName AS "label"
//   ,TableKind AS "type"
// FROM dbc.tablesV
// ${(p) => (p.search ? `WHERE TableName LIKE '%${p.search.toLowerCase()}%'` : "")}
// ORDER BY TableName;
// `;

const searchColumns: IBaseQueries["searchColumns"] = queryFactory`
SELECT TOP ${(p) => p.limit || 10}
  c.ColumnName as "label"
  ,c.TableName as "table"
  ,${helper_ColTypeCASE} AS "dataType"
  ,C.Nullable AS "isNullable"
  ,NULL AS "isPk" 
  ,'${ContextValue.COLUMN}' as "type"
FROM dbc.columnsV AS C 
WHERE 1 = 1
${(p) => {
  console.log(p);
  return "";
}}
${(p) =>
  p.tables.filter((t) => !!t.label).length
    ? `AND c.TableName IN (${p.tables
        .filter((t) => !!t.label)
        .map((t) => `'${t.label}'`.toLowerCase())
        .join(", ")})`
    : ""}
${(p) => {
  const term = splitSearch(ContextValue.COLUMN, p.search.toLowerCase())[
    "column"
  ];
  return p.search
    ? `AND (
    LOWER(c.ColumnName || '.' || c.TableName) LIKE '%${term}%'
    OR LOWER(c.ColumnName) LIKE '%${term}%'
  )`
    : "";
}}
ORDER BY c.ColumnName ASC;
`;

export default {
  fetchDatabases,
  fetchChildDatabases,
  describeTable,
  countRecords,
  fetchColumns,
  fetchRecords,
  fetchTables,
  fetchViews,
  searchTables,
  searchColumns,
};
