import { Directory, File, Paths } from 'expo-file-system';

const directory = new Directory(Paths.document, 'plantation-photos');

function removeOwnedFile(uri, parent) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.uri.startsWith(parent.uri.replace(/\/$/, '') + '/') && file.exists) file.delete();
  } catch {
    // A missing or locked file should not undo a successful record write.
  }
}

export function discardCapture(uri) {
  removeOwnedFile(uri, Paths.cache);
}

export const photoFiles = {
  async copy(uri) {
    directory.create({ idempotent: true });
    const source = new File(uri);
    const name = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    const destination = new File(directory, name + (source.extension || '.jpg'));
    try {
      await source.copy(destination);
      return destination.uri;
    } catch (error) {
      removeOwnedFile(destination.uri, directory);
      throw error;
    }
  },
  remove(uri) {
    removeOwnedFile(uri, directory);
  },
};
