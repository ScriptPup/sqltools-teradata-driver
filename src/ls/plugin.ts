/** @format */

import { ILanguageServerPlugin } from "@sqltools/types";
import TeraDriver from "./driver";
import { DRIVER_ALIASES } from "./../constants";

const TeraDriverPlugin: ILanguageServerPlugin = {
  register(server) {
    DRIVER_ALIASES.forEach(({ value }) => {
      server.getContext().drivers.set(value, TeraDriver as any);
    });
  },
};

export default TeraDriverPlugin;
