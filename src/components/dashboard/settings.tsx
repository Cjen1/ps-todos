import { ChangeEvent, FC, useCallback } from "react";
import { useY } from "react-yjs";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetHeader } from "../ui/sheet";
import { Input } from "../ui/input";
import { DashboardStore } from "./store";
import { Menu } from "lucide-react";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

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
      <SheetContent side={side}>
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
              onClick={() => datastore.create_new_project()}
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
          <ul className="flex flex-col gap-2">
            <div key="1" className="flex flex-col gap-2">
              <Label className="justify-center">Project 1</Label>
              <div className="flex flex-row gap-2">
                <Label className="">Petname</Label>
                <Input value="Project 1"/>
              </div>
              <Button variant="outline">Delete</Button>
            </div>
            <div key="2" className="flex flex-col gap-2">
              <Label className="justify-center">Project 2</Label>
              <div className="flex flex-row gap-2">
                <Label className="">Petname</Label>
                <Input value="Project 2"/>
              </div>
              <Button variant="outline">Delete</Button>
            </div>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  )
}