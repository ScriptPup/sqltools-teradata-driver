/** @format */

import AbstractDriver from "@sqltools/base-driver";
import queries from "./queries";
import {
  IConnectionDriver,
  MConnectionExplorer,
  NSDatabase,
  ContextValue,
  Arg0,
} from "@sqltools/types";
import { v4 as generateId } from "uuid";
import * as TeradataConnector from "teradata-nodejs-driver";
import { teradata_connect } from "./teradata-connect";

/**
 * set Driver lib to the type of your connection.
 * Eg for postgres:
 * import { Pool, PoolConfig } from 'pg';
 * ...
 * type DriverLib = Pool;
 * type DriverOptions = PoolConfig;
 *
 * This will give you completions iside of the library
 */
type DriverLib = TeradataConnector.TeradataConnection;
type DriverOptions = TeradataConnector.ITDConnParams;

export default class TeraDriver
  extends AbstractDriver<DriverLib, DriverOptions>
  implements IConnectionDriver
{
  /**
   * If you driver depends on node packages, list it below on `deps` prop.
   * It will be installed automatically on first use of your driver.
   */
  // public readonly deps: typeof AbstractDriver.prototype["deps"] = [
  //   {
  //     type: AbstractDriver.CONSTANTS.DEPENDENCY_PACKAGE,
  //     name: "lodash",
  //     // version: 'x.x.x',
  //   },
  //   {
  //     type: AbstractDriver.CONSTANTS.DEPENDENCY_PACKAGE,
  //     name: "teradata-nodejs-driver",
  //     version: "1.0.0-rc.2",
  //   },
  // ];

  queries = queries;

  /** if you need to require your lib in runtime and then
   * use `this.lib.methodName()` anywhere and vscode will take care of the dependencies
   * to be installed on a cache folder
   **/
  // private get lib() {
  //   return this.requireDep('node-packge-name') as DriverLib;
  // }

  public async open() {
    if (this.connection) {
      return this.connection;
    }
    const connector_params: TeradataConnector.ITDConnParams = {
      user: this.credentials.username,
      password: this.credentials.password,
      host: this.credentials.server,
      logmech: this.credentials.tdsqloptions.logmech,
      encryptdata: this.credentials.tdsqloptions.encryptdata.toString(),
      dbs_port: this.credentials.port.toString(),
      tmode: this.credentials.tdsqloptions.tmode,
    };
    this.connection = Promise.resolve(
      await teradata_connect(connector_params).catch((e) => {
        console.error("Failed to connect with errors");
        console.error(e);
        throw "Failed to open connection";
      })
    );
    return Promise.resolve(this.connection);
  }

  public async close() {
    if (!this.connection) return Promise.resolve();
    /**
     * cose you connection here!!
     */
    (await this.connection).close();
    this.connection = null;
  }

  private resultsToChildren: any = (queryResults: any, cols: any[]) => {
    return queryResults.map((result) => {
      return result
        .map((item, i) => ({ [cols[i]]: item }))
        .reduce((json, val) => Object.assign({}, json, val));
    });
  };

  public query: typeof AbstractDriver["prototype"]["query"] = async (
    queries,
    opt = {}
  ) => {
    const QRYList: string[] = (queries as string).split(";");
    await this.open();
    try {
      const resultsAgg: NSDatabase.IResult[] = [];
      for (let iq in QRYList) {
        var query = QRYList[iq];
        if (query.length < 1) {
          continue;
        }
        const cursor = (await this.connection).cursor();
        cursor.execute(query as string);
        const queriesResults = cursor.fetchall();
        const cols = cursor.description.map((x) => x[0]);
        resultsAgg.push({
          cols: cols,
          connId: this.getId(),
          messages: [
            {
              date: new Date(),
              message: `Query ok with ${queriesResults.length} results`,
            },
          ],
          results: this.resultsToChildren(queriesResults, cols),
          query: query.toString(),
          requestId: opt.requestId,
          resultId: generateId(),
        });

        /**
         * write the method to execute queries here!!
         */
      }
      // console.debug("Returned query...", resultsAgg);
      return resultsAgg;
    } catch (e) {
      console.error(e);
      throw `Failed to return query, ${query}`;
    }
  };

  /** if you need a different way to test your connection, you can set it here.
   * Otherwise by default we open and close the connection only
   */
  public async testConnection() {
    console.log("Executing connection test");
    try {
      await this.open();
      await this.query("SELECT 1", {});
    } catch (e) {
      console.error("Connection test failed with message");
      console.error(e);
      throw "Connection test failed.";
    }
    console.log("Teradata connection test completed successfully!");
  }

  /**
   * This method is a helper to generate the connection explorer tree.
   * it gets the child items based on current item
   */
  public async getChildrenForItem({
    item,
    parent,
  }: Arg0<IConnectionDriver["getChildrenForItem"]>) {
    switch (item.type) {
      case ContextValue.CONNECTION:
      case ContextValue.CONNECTED_CONNECTION:
        return this.queryResults(
          this.credentials.tdsqlpreferences.showuserdbs
            ? this.queries.fetchDatabasesAndUsers()
            : this.queries.fetchDatabases()
        );
      case ContextValue.TABLE:
      case ContextValue.VIEW:
        return this.getColumns(item as NSDatabase.ITable);
      case ContextValue.DATABASE:
        return new Promise<MConnectionExplorer.IChildItem[]>(
          async (resolve) => {
            const dbs = await this.queryResults(
              this.credentials.tdsqlpreferences.showuserdbs
                ? this.queries.fetchChildDatabasesAndUsers(item)
                : this.queries.fetchChildDatabases(item)
            );
            resolve([
              {
                label: "Tables",
                type: ContextValue.RESOURCE_GROUP,
                iconId: "folder",
                childType: ContextValue.TABLE,
                schema: item.schema,
                database: item.database,
              },
              {
                label: "Views",
                type: ContextValue.RESOURCE_GROUP,
                iconId: "folder",
                childType: ContextValue.VIEW,
                schema: item.schema,
                database: item.database,
              },
              ...dbs,
            ]);
          }
        );
      case ContextValue.RESOURCE_GROUP:
        return this.getChildrenForGroup({ item, parent });
    }
    return [];
  }

  /**
   * This method is a helper to generate the connection explorer tree.
   * It gets the child based on child types
   */
  private async getChildrenForGroup({
    parent,
    item,
  }: Arg0<IConnectionDriver["getChildrenForItem"]>) {
    switch (item.childType) {
      // Teradata doesn't have the concept of SCHEMA, leaving this out
      // case ContextValue.SCHEMA:
      case ContextValue.TABLE:
        console.debug("Getting tables!");
        try {
          return this.queryResults(
            this.queries.fetchTables(parent as NSDatabase.ISchema)
          );
        } catch (e) {
          console.error("Failed to retrieve tables", e);
        }
      case ContextValue.VIEW:
        console.debug("Getting views!");
        return this.queryResults(
          this.queries.fetchViews(parent as NSDatabase.ISchema)
        );
      case ContextValue.FUNCTION:
        return []; //this.queryResults(this.queries.fetchFunctions(parent as NSDatabase.ISchema));
    }
    return [];
  }

  private async getColumns(
    parent: NSDatabase.ITable
  ): Promise<NSDatabase.IColumn[]> {
    const results = await this.queryResults(this.queries.fetchColumns(parent));
    return results.map((col) => ({
      ...col,
      iconName: col.isPk ? "pk" : col.isFk ? "fk" : null,
      childType: ContextValue.NO_CHILD,
      table: parent,
    }));
  }

  /**
   * This method is a helper for intellisense and quick picks.
   */
  public searchItems(
    itemType: ContextValue,
    search: string,
    extraParams: any = {}
  ): Promise<NSDatabase.SearchableItem[]> {
    switch (itemType) {
      case ContextValue.TABLE:
        return this.queryResults(this.queries.searchTables({ search }));
      case ContextValue.COLUMN:
        console.debug("Searching for a column");
        return this.queryResults(
          this.queries.searchColumns({ search, ...extraParams })
        );
    }
  }

  public getStaticCompletions: IConnectionDriver["getStaticCompletions"] =
    async () => {
      return {}; // This works very badly/slowly. It's probably not worth having it.
    };
}
