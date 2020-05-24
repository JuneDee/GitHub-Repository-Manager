import path from 'path';

// consts.ts (this file) is compiled to [project]/out.
export const srcPath = path.resolve(__dirname, '..');
export const envPath = path.resolve(__dirname, '..', '..', '.env');

export const githubUrl = 'https://github.com';