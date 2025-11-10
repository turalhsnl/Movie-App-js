#!/usr/bin/env node

const { execFileSync } = require('child_process');

function runGit(args, options = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function ensureCleanWorkingTree() {
  const status = runGit(['status', '--porcelain']);
  if (status.length > 0) {
    throw new Error(
      'Working tree has uncommitted changes. Commit or stash them before updating the "latest" branch.'
    );
  }
}

function main() {
  try {
    const repoRoot = runGit(['rev-parse', '--show-toplevel']);
    process.chdir(repoRoot);

    ensureCleanWorkingTree();

    const currentBranch = runGit(['rev-parse', '--abbrev-ref', 'HEAD']);

    execFileSync('git', ['branch', '-f', 'latest'], { stdio: 'inherit' });

    console.log(`\nBranch "latest" now points to the tip of "${currentBranch}".`);
    console.log(
      'Run `git push --set-upstream origin latest --force-with-lease` to update the remote branch if desired.'
    );
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}

main();
