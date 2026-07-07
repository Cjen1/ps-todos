import { FC, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { add_existing_project, create_new_project, Dashboard, delete_project, move_project, ordered_project_urls, update_dashboard_title, update_project_petname } from "./store";
import { Menu, Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useDocument, useRepo, Repo, AutomergeUrl, isValidAutomergeUrl } from "@automerge/react";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Project } from "@/components/project/store";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { DragHandle } from "@/components/ui/handles";

const exportProject = async (repo: Repo, purl: AutomergeUrl) => {
  const project_promise = await repo.find<Project>(purl);
  if (!project_promise) {
    console.error("Project not found in repo:", purl);
    return;
  }
  const project = await project_promise.doc();
  if (!project) {
    console.error("Project not found:", purl);
    return;
  }

  console.log(project);

  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `project-${purl}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
const uploadProject = async (repo: Repo, changeDoc: any, file: File) => {
  try {
    const text = await file.text();
    const projectData = JSON.parse(text);
    const handle = repo.create<Project>(projectData);
    const purl = handle.url;

    const petname = file.name.replace(/\.json$/i, '');
    changeDoc((doc: Dashboard) => {
      if (!doc.projects) {
        doc.projects = {};
      }
      doc.projects[purl] = {
        petname: petname,
        order: Object.keys(doc.projects).length,
      };
    });
    console.log("Project uploaded successfully:", purl);
  } catch (error) {
    console.error("Error uploading project:", error);
  }
}

const SingleProjectSettings: FC<{ dashboard_url: AutomergeUrl, purl: AutomergeUrl }> = ({ dashboard_url, purl }) => {
  const [dashboard, changeDoc] = useDocument<Dashboard>(dashboard_url);
  const repo: Repo = (useRepo() as any) as Repo;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: purl });
  const transform_style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const project = dashboard?.projects[purl];
  if (!dashboard || !project) {
    return (
      <li key={purl} className="flex flex-col gap-2" ref={setNodeRef} style={transform_style}>
        <Label className="justify-center">{purl}</Label>
      </li>
    );
  }

  return (
    <li
      key={purl}
      className="flex flex-col gap-2"
      ref={setNodeRef}
      style={transform_style}
      data-testid="project-settings"
      data-project-id={purl}
    >
      <div className="flex flex-row items-center gap-2">
        <button
          type="button"
          className="touch-none"
          {...listeners}
          {...attributes}
        >
          <DragHandle />
        </button>
        <div className="flex justify-center break-all" data-testid="project-url">{purl}</div>
      </div>
      <div className="flex flex-row gap-2">
        <Label className="w-fit">Petname</Label>
        <Input
          value={project.petname}
          onChange={(event) => update_project_petname(changeDoc, purl, event.target.value)}
          className="flex"
          data-testid="project-petname"
        />
        <button
          data-testid="export-project"
          onClick={() => exportProject(repo, purl)}>
          <Download />
        </button>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" data-testid="delete-project">Delete</Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>Are you sure you want to delete this project?</Label>
            <Button variant="destructive" data-testid="confirm-delete-project" onClick={() => delete_project(changeDoc, purl)}>
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      uploadProject(repo, changeDoc, file);
    } else if (file) {
      alert("Please select a valid JSON file.");
    }
    // Reset the file input
    event.target.value = "";
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) {
      return;
    }
    move_project(changeDoc, event.active.id.toString() as AutomergeUrl, event.over.id.toString() as AutomergeUrl);
  };

  const project_urls = dashboard ? ordered_project_urls(dashboard) : [];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button" data-testid="dashboard-settings-trigger"><Menu /></button>
      </SheetTrigger>
      <SheetContent side="left" className="max-w-md w-fit h-full" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col overflow-y-auto gap-3 px-4 w-fit">
          <Separator />
          <div className="flex flex-row gap-2">
            <Label className="">Title</Label>
            <Input
              value={dashboard?.name}
              onChange={(event) => update_dashboard_title(changeDoc, event.target.value)}
            />
          </div>
          <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={project_urls} strategy={verticalListSortingStrategy}>
              {project_urls.map((purl) => {
                return (
                  <div key={purl} className="flex flex-col gap-2">
                    <Separator />
                    <SingleProjectSettings dashboard_url={dashboard_url} purl={purl as AutomergeUrl} />
                  </div>
                )
              })}
            </SortableContext>
          </DndContext>
          <Separator />
          <div className="flex flex-row gap-2">
            <Input
              placeholder="Petname"
              className=""
              value={input_new_project_petname}
              data-testid="new-project-petname"
              onChange={(event) => update_input_new_project_petname(event.target.value)} />
            <Button
              variant="outline"
              className=""
              data-testid="create-project"
              onClick={() => create_new_project(repo, changeDoc, input_new_project_petname)}
            >
              Create new project
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Input placeholder="Petname" className=""
                data-testid="existing-project-petname"
                onChange={(event) => update_input_existing_project_petname(event.target.value)} />
              <Input placeholder="automerge:<token>" className=""
                data-testid="existing-project-url"
                onChange={(event) => update_input_existing_project_url(event.target.value)} />
            </div>
            <Button variant="outline" className="" data-testid="add-existing-project" onClick={() => {
              if (isValidAutomergeUrl(input_existing_project_url)) {
                add_existing_project(changeDoc, input_existing_project_url, input_existing_project_petname)
              }
            }}>
              Add existing project
            </Button>
          </div>
          <Separator />
          <div className="flex flex-row gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              className="w-full"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload project
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
};
