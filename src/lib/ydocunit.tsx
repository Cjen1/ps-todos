import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { HocuspocusProvider } from '@hocuspocus/provider';


class YDocUnit {
  ydoc: Y.Doc;
  main: Y.Map<any>;
  iddb: IndexeddbPersistence;
  remote : HocuspocusProvider;

  constructor(token: string, url: string, auth_token: string) {
    this.ydoc = new Y.Doc();
    this.main = this.ydoc.getMap(token);
    this.iddb = new IndexeddbPersistence(token, this.ydoc);
    this.remote = new HocuspocusProvider({
      url: url,
      name: token,
      token: auth_token
    });
  }
}

export {YDocUnit}