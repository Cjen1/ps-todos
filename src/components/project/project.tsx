import { YDocUnit } from "@/lib/ydocunit";
import { FC, useRef } from "react";
import { useY } from "react-yjs";

class ProjectStore extends YDocUnit {
  /* {
   * name: string,
   * tasks: Set(string) = Y.Map<>
   * }
  */
  constructor(token: string, url: string, auth_token: string) {
    super(token, url, auth_token);
  }
}

const Project: FC<{ petname: string, token: string, url: string, auth_token: string }> = ({ petname, token, url, auth_token }) => {
  const store = useRef(null as ProjectStore | null);
  function getStore() {
    if (store.current === null) {
      store.current = new ProjectStore(token, url, auth_token);
    }
    return store.current;
  }
  console.log("petname", petname);

  return (
    <div className="bg-card">
      Project: {petname}
    </div>
  )
}

export { Project }