import { FC} from "react";
//import { Project } from "../project/project";
import { DashboardSettings } from "./settings";
import { Label } from "../ui/label";
import { object_map } from "@/lib/utils";
import { type AutomergeUrl} from "@automerge/automerge-repo";
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import { type Dashboard } from "./store";
import {Project} from "../project/project";

const Dashboard: FC<{ url: AutomergeUrl }> = ({ url }) => {
  const [dashboard, _] = useDocument<Dashboard>(url);
  if (!dashboard) {
    return <Label>Error: url invalid</Label>
  }

  return (
    <div className="bg-background flex flex-col h-screen">
      <div className="flex flex-row justify-between items-center">
        <DashboardSettings dashboard_url={url}/>
        <Label className="text-xl justify-center">
          {dashboard.name}
        </Label>
      </div>
      <ul className="flex flex-col gap-4 px-2">
        {object_map(dashboard.projects, (purl, { petname }) => {
          return (<li key={purl}>
            <Project project_url={purl as AutomergeUrl} petname={petname} />
          </li>)
        })}
      </ul>
    </div>
  )
}

export { Dashboard }