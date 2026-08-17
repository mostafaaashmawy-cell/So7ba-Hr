const fs = require('fs');
const git = require('isomorphic-git');

const dir = __dirname;

async function commitFeatures() {
  console.log('Staging files...');
  const files = [
    'supabase/schema_updates_v6.sql',
    'lib/types/database.ts',
    'components/common/PageGuideModal.tsx',
    'components/layout/AppSidebar.tsx',
    'components/Navbar.tsx',
    'app/dashboard/settings/page.tsx',
    'app/onboarding/page.tsx',
    'app/dashboard/targets/page.tsx',
    'app/dashboard/sales/page.tsx',
    'components/dashboard/HomeTaskAnalytics.tsx',
    'app/dashboard/admin/page.tsx',
    'app/dashboard/manager/page.tsx'
  ];

  for (const f of files) {
    if (fs.existsSync(f)) {
      await git.add({ fs, dir, filepath: f });
    }
  }

  console.log('Committing features...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Mostafa Ashmawy',
      email: 'mostafa.ashmawy@example.com',
    },
    message: 'feat: add multi-level collapsible sidebar, company policies settings hub, setup wizard re-trigger, on-demand page guide, single day target picker, KPI units dropdown, and home task analytics',
  });

  console.log(`Commit created! SHA: ${sha}`);
}

commitFeatures().catch((err) => {
  console.error('Commit error:', err);
  process.exit(1);
});
