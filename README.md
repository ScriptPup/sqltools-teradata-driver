<!-- @format -->

# SQLTools Teradata Driver

This package is part of vscode-sqltools extension.

# Known Issues and Fixed

## Dynamic Linking Error

Due to how the official teradata-nodejs-driver driver being badly packaged and maintained, the plugin may fail with `Error: Dynamic Linking Error: Win32 error 126`.
This is due to a known bug with a PR that's been open for almost a year (as of writing).

### Workarounds

There are two ways to workaround this issue.

1. Install the teradata-nodejs-driver anywhere with npm, then add the root folder (outside of the node_modules folder) to your environment PATH.
2. Install the teradata-nodejs-driver globally. The second is somewhat simpler so I would recommend this. Plus, then once the maintainer finally accepts the PR, users can simply run `npm uninstall teradata-nodejs-driver -g` to remove the extra package.

I did have some trouble installing the teradata-nodejs-driver on older versions of nodejs. I recommend running the install after updating to at least version 14.18.1.

References:

- teradata-nodejs-driver bug: https://github.com/Teradata/nodejs-driver/issues/1

# Setup

Use the visual studio code extension manager and:

1. Install vscode-sqltools
2. Install sqltools-teradata-driver

# Development

If you'd like to contribute please feel free.

1. Clone this repository and open it in VS Code.
2. Change your git branch to a meaningfully named branch for your development goal.
3. Run npm install to install dependencies.
4. Press F5 to start a debuging session. This opens a new VS Code window with a development version of the driver extension loaded. Output from the extension with your local changes shows up in the Debug Console, with console output showing in the new window. You can set break points, step through your code, and inspect variables either in the Debug view or the Debug Console (somewhat, I could only get the extension.ts file to connect to the debug host correctly).
5. Once your changes are made, create a PR back to the repository. If you've never created a PR, [github's documentation](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) is pretty extensive.

Please make at least one commit per feature/fix. Please avoid large commits with a large list of changes, it makes it easier to review code changes and understand what's done.
