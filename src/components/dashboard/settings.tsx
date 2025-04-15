import { ChangeEvent, FC, useCallback } from "react";
import { useY } from "react-yjs";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetHeader } from "../ui/sheet";
import { Input } from "../ui/input";
import { DashboardStore, ProjectMetadata } from "./store";
import { Menu } from "lucide-react";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { object_map } from "@/lib/utils";

const ProjectSettings : FC<{datastore: DashboardStore}> = ({datastore}) => {
  const projects = useY(datastore.get_projects_map())

  console.log("Rerender");

  const handlePetnameChange = useCallback(
    (ptoken: string, event: ChangeEvent<HTMLInputElement>) => {
      console.log("handlePetnameChange", ptoken, event.target.value);
      datastore.map_project_metadata(ptoken, (metadata: ProjectMetadata) => {
        metadata.petname = event.target.value;
      });
      console.log("handlePetnameChange", datastore.get_projects_map().get(ptoken));
    }, []);

  return (
    <ul className="flex flex-col gap-2">
      {object_map(projects, (ptoken, { petname }) => {
        return (<li key={ptoken} className="flex flex-col gap-2">
          <Label className="justify-center">{ptoken}</Label>
          <div className="flex flex-row gap-2">
            <Label className="">Petname</Label>
            <Input value={petname}
              onChange={(event) => handlePetnameChange(ptoken, event)}
            />
          </div>
          <Button variant="outline">Delete</Button>
        </li>
        )
      })}
    </ul>
  )
};

export const DashboardSettings: FC<{ datastore: DashboardStore, side: "left" | "right" }> = ({ datastore, side }) => {
  const dashboardData = useY(datastore.main);

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      datastore.main.set("name", event.target.value);
    },
    [],
  );

  return (
    <Sheet >
      <SheetTrigger asChild>
        <Button variant="link"><Menu /></Button>
      </SheetTrigger>
      <SheetContent side={side} aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-2">
          <Separator />
          <div className="flex flex-row gap-2">
            <Label className="">Title</Label>
            <Input
              value={dashboardData.name}
              onChange={handleNameChange}
            />
          </div>
          <Separator />
          <div className="flex flex-row gap-2">
            <Input placeholder="Petname" className="" />
            <Button
              variant="outline"
              className=""
              onClick={() => datastore.create_new_project("tbd")}
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
            <Button variant="outline" className="flex-grow" onClick={() => console.log("Add existing project")}>
              Add existing project
            </Button>
          </div>
          <Separator />
          <ProjectSettings datastore={datastore} />
        </div>
      </SheetContent>
    </Sheet>
  )
}