import * as fs from 'fs';

import { promisify } from './promisify';

export const readFileAsync = promisify(fs.readFile);
export const writeFileAsync = promisify(fs.writeFile);
