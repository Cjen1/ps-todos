import { FC} from "react";
//import { Project } from "../project/project";
import { DashboardSettings } from "./settings";
import { Label } from "../ui/label";
import { object_map } from "@/lib/utils";
import { type AutomergeUrl} from "@automerge/automerge-repo";
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import { type Dashboard } from "./store";

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
      <ul className="flex flex-col gap-5">
        {object_map(dashboard.projects, (purl, { petname }) => {
          return (<li key={purl}>
            <div>
              <div>{purl}</div>
              <div>{petname}</div>
            </div>
          </li>)
        })}
      </ul>
    </div>
  )
}

export { Dashboard }