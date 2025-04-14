import { FC, useRef } from "react";
import { useY } from "react-yjs";
import { Separator } from "../ui/separator";
import { ProviderState } from "../../lib/connection";
import { Project } from "../project/project";
import { DashboardStore } from "./store";
import { DashboardSettings } from "./settings";
import { Label } from "../ui/label";

const Dashboard: FC<{ token: string, url: string }> = ({ token, url }) => {
  const store = useRef(null as DashboardStore | null);
  function getStore() {
    if (store.current === null) {
      store.current = new DashboardStore(token, url);
    }
    return store.current;
  }

  const dashboardData = useY(getStore().main);

  const projects :  [string, any][] = dashboardData.projects ? Object.entries(dashboardData.projects) : [];

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
        {projects.map(([projectKey, key]) =>
          <li key={key}>
            <Project token={projectKey} url={url} auth_token={token} />
          </li>
        )}
      </ul>
    </div>
  )
}

export { Dashboard }