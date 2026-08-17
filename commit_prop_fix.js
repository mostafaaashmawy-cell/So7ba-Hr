const fs = require('fs');
const git = require('isomorphic-git');

const dir = __dirname;

async function commitPropFix() {
  const f = 'app/dashboard/employee/page.tsx';
  await git.add({ fs, dir, filepath: f });

  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Mostafa Ashmawy',
      email: 'mostafa.ashmawy@example.com',
    },
    message: 'fix: align LeavePermissionForm prop names to initialRecords and holidayWorkCount',
  });

  console.log(`Commit created! SHA: ${sha}`);
}

commitPropFix().catch((err) => {
  console.error('Commit error:', err);
  process.exit(1);
});
