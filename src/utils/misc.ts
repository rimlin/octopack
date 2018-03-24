import { FileType } from '../enums';

export function convertExtensionToFileType(extension: string): FileType {
  if (extension === 'js') {
    return FileType.JS;
  } else if (extension === 'html') {
    return FileType.HTML;
  }
}
