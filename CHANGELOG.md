<!-- @format -->

# Changelog

# 0.7.0

- Update the teradata driver to version 20.0.20 which fixes memory conflicts with Electron. External node.js instance is no longer required.

# 0.6.0

- Fix native libraries needed by the Teradata driver.

# 0.3.8

- Republish improved readme, extension marketplace not updating same-publish as documentation change.

# 0.3.7

- Improve the README doc.

# 0.3.6

- Use github actions to build and publish platform specific extension.

# 0.3.5

- Switch to platform specific packages to support the different native libs required depending host OS

# 0.3.4

- Update icon image to a higher resolution version
- Change activation to prefered onStartupFinished rather than \*

# 0.3.3

- Update teradata-nodejs-driver to 1.0.0-rc.5
  - Removes need for global install

## 0.3.1, 0.3.2

- Fix early host lookup failure breaking COP in some situations
- Change truth check method

## 0.3.0

- Add Teradata COP support
- Move changelog to CHANGELOG.md

## 0.2.0

- Moved logmech into teradata specific form section
- Added encryption option

## 0.1.0

- First working version
