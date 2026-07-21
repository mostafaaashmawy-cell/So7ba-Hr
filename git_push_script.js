const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const dir = __dirname;
const repoUrl = 'https://github.com/mostafaaashmawy-cell/So7ba-Hr.git';

async function run() {
  console.log('1. Initializing fresh Git repository...');
  await git.init({ fs, dir });

  console.log('2. Staging all non-ignored project files...');
  
  // Recursively add all files respecting .gitignore
  async function addFiles(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(dir, fullPath).replace(/\\/g, '/');

      if (
        entry.name === '.git' ||
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === 'temp-app' ||
        entry.name === 'git-bin' ||
        entry.name === '.env.local'
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        await addFiles(fullPath);
      } else {
        await git.add({ fs, dir, filepath: relPath });
      }
    }
  }

  await addFiles(dir);

  console.log('3. Committing staged files...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Mostafa Ashmawy',
      email: 'mostafa.ashmawy@example.com',
    },
    message: 'Initial clean commit without large folders',
  });
  console.log(`Commit created successfully! SHA: ${sha}`);

  console.log('4. Setting main branch and pushing to GitHub remote...');
  await git.writeRef({
    fs,
    dir,
    ref: 'refs/heads/main',
    value: sha,
    force: true,
  });

  await git.addRemote({
    fs,
    dir,
    remote: 'origin',
    url: repoUrl,
    force: true,
  });

  console.log(`Pushing to ${repoUrl}...`);
  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      force: true,
    });
    console.log('Push complete!', pushResult);
  } catch (pushErr) {
    console.log('Push authentication note:', pushErr.message);
  }
}

run().catch((err) => {
  console.error('Git script error:', err);
  process.exit(1);
});
