/**
 * Git utilities for detecting uncommitted changes and repository status.
 */
import { execSync } from 'node:child_process';

/**
 * Check if the working directory has uncommitted changes.
 * @returns {{ hasChanges: boolean, files: string[] }} Status object
 */
export function checkUncommittedChanges() {
  try {
    // Check if we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    } catch {
      // Not a git repository, so no uncommitted changes concern
      return { hasChanges: false, files: [] };
    }

    // Get status in porcelain format for easy parsing
    const output = execSync('git status --porcelain', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    const lines = output.trim().split('\n').filter(line => line.trim());
    
    return {
      hasChanges: lines.length > 0,
      files: lines.map(line => line.slice(3)) // Remove status prefix
    };
  } catch (err) {
    // If git command fails, assume no changes
    console.warn('Warning: Could not check git status:', err.message);
    return { hasChanges: false, files: [] };
  }
}

/**
 * Display uncommitted changes warning and exit if changes detected.
 * @param {Object} options Configuration options
 * @param {boolean} options.allowUncommitted If true, skip the check
 * @param {string} options.scriptName Name of the script for display
 */
export function enforceCleanWorkingTree(options = {}) {
  const { allowUncommitted = false, scriptName = 'this script' } = options;

  if (allowUncommitted) {
    return; // User explicitly allowed uncommitted changes
  }

  const status = checkUncommittedChanges();

  if (status.hasChanges) {
    console.error('\n❌ Uncommitted changes detected!');
    console.error(`\nRunning ${scriptName} with uncommitted changes may cause data loss.`);
    console.error('Please commit or stash your changes before proceeding.\n');
    console.error('Files with uncommitted changes:');
    status.files.slice(0, 10).forEach(file => {
      console.error(`  - ${file}`);
    });
    if (status.files.length > 10) {
      console.error(`  ... and ${status.files.length - 10} more files`);
    }
    console.error('\nOptions:');
    console.error('  1. Commit your changes:    git add . && git commit -m "your message"');
    console.error('  2. Stash your changes:     git stash');
    console.error(`  3. Force proceed:          Add --allow-uncommitted flag\n`);
    process.exit(1);
  }
}

/**
 * Check if --allow-uncommitted flag is present in process arguments.
 * @returns {boolean} True if flag is present
 */
export function hasAllowUncommittedFlag() {
  return process.argv.includes('--allow-uncommitted');
}
