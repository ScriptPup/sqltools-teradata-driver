/** @format */

import * as TeradataConnector from "teradatasql";

const teradata_connect_one = (connector_params) => {
  const connection: TeradataConnector.TeradataConnection =
    new TeradataConnector.TeradataConnection();
  connection.connect(connector_params);
  return connection;
};

// wrapper for TD connect to ease transition off of teradata_cop_connect and potential future changes
export const teradata_connect = (
  connector_params
): Promise<TeradataConnector.TeradataConnection> => {
  return Promise.resolve(teradata_connect_one(connector_params));
};
