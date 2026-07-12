# Releasing

Packages publish to npm from CI using
[Changesets](https://github.com/changesets/changesets).

1. Add a changeset to your PR: run `pnpm changeset`, pick the packages and the bump, and
   commit the generated file.
2. Merge the PR to `main`. A "Version Packages" PR is opened automatically.
3. Merge the "Version Packages" PR to publish to npm.

Publishing uses npm trusted publishing (OIDC), so no tokens are required.
