import { FC } from "react";
//import { Project } from "../project/project";
import { DashboardSettings } from "./settings";
import { Label } from "../ui/label";
import { object_map } from "@/lib/utils";
import { type AutomergeUrl } from "@automerge/automerge-repo";
import { useDocument } from '@automerge/react'
import { type Dashboard } from "./store";
import { Project } from "../project/project";

const Dashboard: FC<{ url: AutomergeUrl }> = ({ url }) => {
  const [dashboard, _] = useDocument<Dashboard>(url);

  return (
    <div className="bg-background flex flex-col h-screen">
      <div className="flex flex-row justify-between items-center px-2 py-1">
        <DashboardSettings dashboard_url={url} />
        <Label className="text-xl justify-center">
          {dashboard?.name}
        </Label>
        <Label>{dashboard ? "Connected" : "Loading"}</Label>
      </div>
      <div className="flex flex-col gap-4 px-2">
        {object_map(dashboard?.projects ?? {}, (project_url, { petname }) => {
          return (
            <Project key={project_url} project_url={project_url as AutomergeUrl} petname={petname} />
          )
        })}
      </div>
    </div>
  )
}

export { Dashboard }