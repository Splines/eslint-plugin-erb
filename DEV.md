# Developer guidelines

## Install as npm package locally to test

Also see [this answer](https://stackoverflow.com/a/28392481/9655481). Basically, inside another project where you want to test the plugin, you can install it as an npm package via a local path:

```bash
npm link /path/to/eslint-plugin-erb
```

Other useful commands:

```bash
npm ls --global
```

Finally to remove the link:

```bash
npm unlink eslint-plugin-erb
```

## Merge strategies

We develop directly on `main`. Whenever a release is ready, we create a new release tag and publish to npm.

- Main branch: protected, only PRs allowed (tests must pass). Use squash commits (!)
- Finally: continuous release by creating a `release/*` branch and merging it into `main` via a PR.

## Create a new release (and publish to npm)

As this is only a small project, we haven't automated publishing to the NPM registry yet and instead rely on the following manual workflow.

- Make sure the tests pass locally: `npm test` ✔
- Make another commit on the `dev` branch bumping the npm version in the `package.json`. For that, use:

```sh
npm run bump-version -- [<newversion> | major | minor | patch]
```

- ⚠ Copy the version specifier from `package.json` into the `index.js` meta information object.
- Call the respective PR for the final changes "Continuous Release <version.number>". Merge this PR into `main`.
- Create a new release via the GitHub UI and assign a new tag alongside that.
- Fetch the tag locally (`git fetch`) and publish to npm via `npm run publish-final`. You probably have to login to npm first (`npm login`).
- Check that the release is available [here on npm](https://www.npmjs.com/package/eslint-plugin-erb). Enjoy ✌
