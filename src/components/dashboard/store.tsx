import { YDocUnit } from "@/lib/ydocunit";
import * as Y from "yjs";
import { nanoid } from "nanoid";

export class DashboardStore extends YDocUnit {
  /* {
   * name: string,
   * projects: Set(string) = Y.Map<>
   * }
  */
  constructor(token: string, url: string) {
    super(token, url, token);
  }

  set_dashboard_title(title: string) {
    this.main.set("name", title);
  }

  add_existing_project(ptoken: string) {
    const projects = this.main.get("projects");
    if (!projects) {
      this.main.set("projects", new Y.Map())
    }

    if (projects.has(ptoken)) {
      console.log("Project already exists");
      return;
    }

    projects.set(ptoken, true);
  }

  create_new_project() {
    const projects = this.main.get("projects");
    if (!projects) {
      this.main.set("projects", new Y.Map())
    }
    const ptoken = nanoid();
    projects.set(ptoken, Math.random());
  }
}