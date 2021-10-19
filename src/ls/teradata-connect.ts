/** @format */

import * as dns from "dns";
import * as TeradataConnector from "teradata-nodejs-driver";

const resolve_cop = async (host: string): Promise<string[]> => {
  const host_parts = host.split(".");
  const host_prefix = host_parts.shift();
  const host_suffix = host_parts.join(".");
  const host_list: string[] = new Array();

  let use_cop = false;
  try {
    await dns.promises.lookup(host);
    use_cop = true;
  } catch {
    console.debug("Hostname provided isn't registered in DNS.");
  }

  // If the host name provided exists by itself, then just connect with that
  // Or if the host name is an IP address then just connect with that
  if (use_cop || host_prefix.search(/^[0-9]+$/g) > -1) {
    host_list.push(host as string);
    return host_list;
  }

  console.debug(
    "Hostname provided isn't an IP address either, attempting COP lookups."
  );

  // Loop through hosts, adding a cop# suffix to the hostname prefix
  // Stop once no new hosts are found
  let i = 0;
  while (true) {
    i++;
    const checkname: string = `${host_prefix}cop${i}.${host_suffix}`;
    const lookup = await dns.promises.lookup(checkname).catch();
    if (!lookup) {
      break;
    } else {
      host_list.push(checkname);
    }
  }
  return host_list;
};

const teradata_connect_one = (connector_params) => {
  const connection: TeradataConnector.TeradataConnection = new TeradataConnector.TeradataConnection();
  connection.connect(connector_params);
  return connection;
};

export const teradata_cop_connect = async (
  connector_params
): Promise<TeradataConnector.TeradataConnection> => {
  const cop_hosts = await resolve_cop(connector_params.host);
  const params = connector_params;
  console.debug("COP host list", cop_hosts);
  for (let hostix in cop_hosts) {
    params["host"] = cop_hosts[hostix];
    try {
      let connect = teradata_connect_one(params);
      return connect;
    } catch {
      console.error(
        ` >> Connection failed during COP round-robin on host: ${params["host"]}`
      );
    }
  }
};
