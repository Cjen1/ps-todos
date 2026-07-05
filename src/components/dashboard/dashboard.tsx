import { FC } from "react";
//import { Project } from "../project/project";
import { DashboardSettings } from "./settings";
import { Label } from "../ui/label";
import { type AutomergeUrl } from "@automerge/automerge-repo";
import { useDocument } from '@automerge/react'
import { ordered_project_urls, type Dashboard } from "./store";
import { Project } from "../project/project";

const Dashboard: FC<{ url: AutomergeUrl }> = ({ url }) => {
  const [dashboard, _] = useDocument<Dashboard>(url);
  window.document.title = dashboard?.name ?? "Dashboard";

  return (
    <div className="bg-background flex flex-col h-screen">
      <div className="flex flex-row justify-between items-center px-2 py-4">
        <DashboardSettings dashboard_url={url} />
        <Label className="text-xl justify-center overflow-y-auto">
          {dashboard?.name}
        </Label>
        <Label>{dashboard ? "Connected" : "Loading"}</Label>
      </div>
      <div className="flex flex-col gap-4 px-2">
        {dashboard && ordered_project_urls(dashboard).map((project_url) => {
          const { petname } = dashboard.projects[project_url];
          return (
            <Project key={project_url} project_url={project_url as AutomergeUrl} petname={petname} />
          )
        })}
      </div>
    </div>
  )
}

export { Dashboard }
