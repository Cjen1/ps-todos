import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { add_existing_project, create_new_project, Dashboard, delete_project, update_dashboard_title, update_project_petname } from "./store";
import { Menu } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AutomergeUrl, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { useDocument, useRepo } from "@automerge/react";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
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
      <div className="justify-center">{purl}</div>
      <div className="flex flex-row gap-2">
        <Label className="">Petname</Label>
        <Input
          value={project.petname}
          onChange={(event) => update_project_petname(changeDoc, purl, event.target.value)}
        />
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Delete</Button>
        </DialogTrigger>
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
  const repo = useRepo();
  const [dashboard, changeDoc] = useDocument<Dashboard>(dashboard_url);

  const [input_new_project_petname, update_input_new_project_petname] = useState("");
  const [input_existing_project_petname, update_input_existing_project_petname] = useState("");
  const [input_existing_project_url, update_input_existing_project_url] = useState("");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button><Menu /></button>
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
              value={dashboard?.name}
              onChange={(event) => update_dashboard_title(changeDoc, event.target.value)}
            />
          </div>
          {object_map(dashboard?.projects ?? {}, (purl, _) => {
            return (
              <div key={purl} className="flex flex-col gap-2">
                <Separator />
                <SingleProjectSettings dashboard_url={dashboard_url} purl={purl as AutomergeUrl} />
              </div>
            )
          })}
          <Separator />
          <div className="flex flex-row gap-2">
            <Input
              placeholder="Petname"
              className=""
              value={input_new_project_petname}
              onChange={(event) => update_input_new_project_petname(event.target.value)} />
            <Button
              variant="outline"
              className=""
              onClick={() => create_new_project(repo, changeDoc, input_new_project_petname)}
            >
              Create new project
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Input placeholder="Petname" className=""
                onChange={(event) => update_input_existing_project_petname(event.target.value)} />
              <Input placeholder="automerge:<token>" className=""
                onChange={(event) => update_input_existing_project_url(event.target.value)} />
            </div>
            <Button variant="outline" className="" onClick={() => {
              if (isValidAutomergeUrl(input_existing_project_url)) {
                add_existing_project(changeDoc, input_existing_project_url, input_existing_project_petname)
              }
            }}>
              Add existing project
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
};