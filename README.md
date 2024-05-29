<!-- @format -->

# SQLTools Teradata Driver

>[!IMPORTANT]
> To use this extension in VS Code 1.77 and above, set `sqltools.useNodeRuntime` setting to `true`. 
> Without the setting, the extension will not initialize as the database driver will fail to load and throw a native error instead.

This SQLTools-based extension supports Teradata databases. Using this extension you can browse databases, tables, views, run queries, export results to CSV and JSON files. Stay connected to multiple Teradata instances at the same time. View query history, bookmark frequently used queries. The extension supports multiple authentication mechanisms including: native database, LDAP, TDNEGO and Kerberos. 

![](https://raw.githubusercontent.com/scriptpup/sqltools-teradata-driver/master/resources/preview-sqltools-teradata-driver.gif)

# Development

If you'd like to contribute please feel free.

1. Clone this repository and open it in VS Code.
2. Change your git branch to a meaningfully named branch for your development goal.
3. Run `npm install` to install dependencies.
4. Run `npm run compile` to compile the .ts scripts into .js
5. Press F5 to start a debuging session. This opens a new VS Code window with a development version of the driver extension loaded. Output from the extension with your local changes shows up in the Debug Console, with console output showing in the new window. You can set break points, step through your code, and inspect variables either in the Debug view or the Debug Console (somewhat, I could only get the extension.ts file to connect to the debug host correctly).
6. Once your changes are made, create a PR back to the repository. If you've never created a PR, [github's documentation](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) is pretty extensive.

Please make at least one commit per feature/fix. Please avoid large commits with a large list of changes, it makes it easier to review code changes and understand what's done.
