import path from 'path';

export const callbackPagePath = '/oauthHtml';

// consts.ts (this file) is compiled to [project]/out.
export const srcPath = path.resolve(__dirname, '..', 'src');
export const envPath = path.resolve(__dirname, '..', '.env');

export const githubUrl = 'https://github.com';