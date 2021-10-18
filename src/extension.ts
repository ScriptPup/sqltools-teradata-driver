/** @format */

import * as vscode from "vscode";
import {
  IExtension,
  IExtensionPlugin,
  IDriverExtensionApi,
} from "@sqltools/types";
import { ExtensionContext } from "vscode";
import { DRIVER_ALIASES } from "./constants";
const { publisher, name, displayName } = require("../package.json");

export async function activate(
  extContext: ExtensionContext
): Promise<IDriverExtensionApi> {
  const sqltools = vscode.extensions.getExtension<IExtension>("mtxr.sqltools");
  if (!sqltools) {
    throw new Error("SQLTools not installed");
  }
  await sqltools.activate();

  const api = sqltools.exports;

  const extensionId = `${publisher}.${name}`;
  const plugin: IExtensionPlugin = {
    extensionId,
    name: `${displayName} Plugin`,
    type: "driver",
    async register(extension) {
      // register ext part here
      extension.resourcesMap().set(`driver/${DRIVER_ALIASES[0].value}/icons`, {
        active: extContext.asAbsolutePath("icons/active.png"),
        default: extContext.asAbsolutePath("icons/default.png"),
        inactive: extContext.asAbsolutePath("icons/inactive.png"),
      });
      DRIVER_ALIASES.forEach(({ value }) => {
        extension
          .resourcesMap()
          .set(`driver/${value}/extension-id`, extensionId);
        extension
          .resourcesMap()
          .set(
            `driver/${value}/connection-schema`,
            extContext.asAbsolutePath("connection.schema.json")
          );
        extension
          .resourcesMap()
          .set(
            `driver/${value}/ui-schema`,
            extContext.asAbsolutePath("ui.schema.json")
          );
      });
      await extension.client.sendRequest("ls/RegisterPlugin", {
        path: extContext.asAbsolutePath("out/ls/plugin.js"),
      });
    },
  };
  api.registerPlugin(plugin);
  return {
    driverName: displayName,
    parseBeforeSaveConnection: ({ connInfo }) => {
      const propsToRemove = ["connectionMethod", "id", "usePassword"];
      if (connInfo.usePassword) {
        if (connInfo.usePassword.toString().toLowerCase().includes("ask")) {
          connInfo.askForPassword = true;
          propsToRemove.push("password");
        } else if (
          connInfo.usePassword.toString().toLowerCase().includes("empty")
        ) {
          connInfo.password = "";
          propsToRemove.push("askForPassword");
        } else if (
          connInfo.usePassword.toString().toLowerCase().includes("save")
        ) {
          propsToRemove.push("askForPassword");
        }
      }
      propsToRemove.forEach((p) => delete connInfo[p]);
      return connInfo;
    },
    parseBeforeEditConnection: ({ connInfo }) => {
      if (connInfo.askForPassword) {
        connInfo.usePassword = "Ask on connect";
        delete connInfo.password;
      } else if (typeof connInfo.password === "string") {
        delete connInfo.askForPassword;
        connInfo.usePassword = connInfo.password
          ? "Save password"
          : "Use empty password";
      }
      return connInfo;
    },
    driverAliases: DRIVER_ALIASES,
  };
}

export function deactivate() {}
