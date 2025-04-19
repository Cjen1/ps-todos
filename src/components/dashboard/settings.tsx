import {FC, useState} from "react";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetHeader } from "../ui/sheet";
import { Input } from "../ui/input";
import { create_new_project, Dashboard, delete_project, ProjectMetadata, update_dashboard_title, update_project_petname } from "./store";
import { Menu } from "lucide-react";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { AutomergeUrl } from "@automerge/automerge-repo";
import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "../ui/dialog";
import { object_map } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";

const SingleProjectSettings: FC<{ dashboard_url: AutomergeUrl, purl: AutomergeUrl }> = ({ dashboard_url, purl }) => {
  const [dashboard, changeDoc] = useDocument<Dashboard>(dashboard_url);
  const project = dashboard?.projects[purl];
  if (!dashboard || !project) {
    return (
      <li key={purl} className="flex flex-col gap-2">
        <Label className="justify-center">{purl}</Label>
      </li>
    );
  }

  return (
    <li key={purl} className="flex flex-col gap-2">
      <Label className="justify-center">{purl}</Label>
      <div className="flex flex-row gap-2">
        <Label className="">Petname</Label>
        <Input
          value={project.petname}
          onChange={(event) => update_project_petname(changeDoc, purl, event.target.value)}
        />
      </div>
      <Dialog>
        <DialogTrigger>Delete</DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>Are you sure you want to delete this project?</Label>
            <Button variant="destructive" onClick={() => delete_project(changeDoc, purl)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </li>
  );
};

export const DashboardSettings: FC<{ dashboard_url: AutomergeUrl }> = ({ dashboard_url }) => {
  const [dashboard, changeDoc] = useDocument<Dashboard>(dashboard_url);
  if (!dashboard) {
    return <Label>Error: url invalid</Label>
  }

  const [input_new_project_petname, update_input_new_project_petname] = useState("");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link"><Menu /></Button>
      </SheetTrigger>
      <SheetContent side="left" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-2">
          <Separator />
          <div className="flex flex-row gap-2">
            <Label className="">Title</Label>
            <Input
              value={dashboard.name}
              onChange={(event) => update_dashboard_title(changeDoc, event.target.value)}
            />
          </div>
          <Separator />
          <div className="flex flex-row gap-2">
            <Input 
              placeholder="Petname" 
              className="" 
              value={input_new_project_petname}
              onChange={(event) => update_input_new_project_petname(event.target.value)}/>
            <Button
              variant="outline"
              className=""
              onClick={() => create_new_project(changeDoc, input_new_project_petname)}
            >
              Create new project
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Input placeholder="Petname" className="" />
              <Input placeholder="Token" className="" />
            </div>
            <Button variant="outline" className="" onClick={() => console.log("Add existing project")}>
              Add existing project
            </Button>
          </div>
          <Separator />
          {object_map(dashboard.projects, (purl, _) => {
            return (<SingleProjectSettings key={purl} dashboard_url={dashboard_url} purl={purl as AutomergeUrl} />)
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
};