# Contributing

## Setup Instructions

1. Clone the repository somewhere *other than your Foundry data directory*.
2. Run `npm install`.
3. Find your Foundry 'Data' folder and copy it to your clipboard.
4. Run `npm run link` and paste in the location.
5. Run `npm run build:pack` after making any changes code-side.
6. Run `npm run unpack` after making any compendium changes in Foundry.

## Commits and Pull Requests

- Structure your commits and PRs like so: `type(subject): short description`.
- Use new lines in the description of the commit for more advanced/correlated changes.
- Valid types include feat (feature/improvement), fix (bug fixes, error related changes, etc), chore (anything else that's necessary).
