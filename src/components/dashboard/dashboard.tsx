import { FC, useRef } from "react";
import { useY } from "react-yjs";
import { ProviderState } from "../../lib/connection";
import { Project } from "../project/project";
import { DashboardStore } from "./store";
import { DashboardSettings } from "./settings";
import { Label } from "../ui/label";
import { object_map } from "@/lib/utils";

const Dashboard: FC<{ token: string, url: string }> = ({ token, url }) => {
  const store = useRef(null as DashboardStore | null);
  function getStore() {
    if (store.current === null) {
      store.current = new DashboardStore(token, url);
    }
    return store.current;
  }

  const dashboardData = useY(getStore().main);
  const projects = useY(getStore().get_projects_map());
  console.log("projects", projects);

  return (
    <div className="bg-background flex flex-col h-screen">
      <div className="flex flex-row justify-between items-center">
        <DashboardSettings datastore={getStore()} side="left" />
        <Label className="text-xl justify-center">
          {dashboardData.name}
        </Label>
        <ProviderState provider={getStore().remote} />
      </div>
      <ul className="flex flex-col gap-5">
        {object_map(projects, (ptoken, { petname }) => {
          return (<li key={ptoken}>
            <Project petname={petname} token={ptoken} url={url} auth_token={token} />
          </li>)
        })}
      </ul>
    </div>
  )
}

export { Dashboard }