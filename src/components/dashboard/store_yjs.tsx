import { YDocUnit } from "@/lib/ydocunit";
import * as Y from "yjs";
import { nanoid } from "nanoid";

export type ProjectMetadata = {
  petname: string;
}

export class DashboardStore extends YDocUnit {
  /* {
   * name: string,
   * projects: Set(string) = Y.Map<>
   * }
  */
  constructor(token: string, url: string) {
    super(token, url, token);
    this.get_projects_map().observeDeep((_)=>{
      console.log("Projects changed", this.get_projects_map().toJSON());
    })
  }

  set_dashboard_title(title: string) {
    this.main.set("name", title);
  }

  get_projects_map() : Y.Map<ProjectMetadata>{
    if (!this.main.has("projects")) {
      this.main.set("projects", new Y.Map())
    }
    return this.main.get("projects");
  }

  add_existing_project(ptoken: string, petname: string) {
    const projects = this.get_projects_map(); 

    if (projects.has(ptoken)) {
      console.log("Project already exists");
      return;
    }

    projects.set(ptoken, { petname } as ProjectMetadata);
  }

  create_new_project(petname: string) {
    const projects = this.get_projects_map();
    const ptoken = nanoid();
    projects.set(ptoken, { petname } as ProjectMetadata);
  }

  delete_project(ptoken: string) {
    const projects = this.get_projects_map();

    if (!projects.has(ptoken)) {
      console.log("Project does not exist");
      return;
    }

    projects.delete(ptoken);
  }

  map_project_metadata(ptoken: string, lambda: (metadata : ProjectMetadata) => void) {
    const projects = this.get_projects_map();

    if (!projects.has(ptoken)) {
      console.log("Project does not exist");
      return;
    }

    const metadata = projects.get(ptoken) ?? { petname: "" } as ProjectMetadata;
    lambda(metadata);
    projects.set(ptoken, metadata);
  }
}