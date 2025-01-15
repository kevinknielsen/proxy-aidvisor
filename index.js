
import { execSync } from 'child_process';

try {
  execSync('cd eliza-starter && pnpm start -- --characters=characters/proxy_aidvisor.character.json', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start Eliza:', error);
  process.exit(1);
}
