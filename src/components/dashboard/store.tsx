import { Repo, type AutomergeUrl, updateText, ChangeFn } from '@automerge/react'
import { Project, new_project } from "@/components/project/store";
import { moved_order, ordered_items, random_order_between } from "@/lib/ordering";

export type ProjectMetadata = {
    petname: string;
    order?: number;
};

export type Dashboard = {
    name: string;
    projects: { [key: AutomergeUrl]: ProjectMetadata };
};

type ChangeDoc = (changeFn: ChangeFn<Dashboard>, options?: any) => void;

function ordered_project_entries(projects: Dashboard["projects"]) {
    const project_entries = Object.entries(projects);
    return ordered_items(project_entries.map(([project_url, project], index) => {
        return {
            id: project_url as AutomergeUrl,
            order: project.order ?? ((index + 1) / (project_entries.length + 1)),
        };
    }));
}

function next_project_order(projects: Dashboard["projects"]) {
    const ordered_projects = ordered_project_entries(projects);
    if (ordered_projects.length === 0) {
        return random_order_between(0, 1);
    }
    return random_order_between(ordered_projects[ordered_projects.length - 1].order, 1);
}

export function ordered_project_urls(dashboard: Dashboard) {
    return ordered_project_entries(dashboard.projects).map(({ id }) => id);
}

export function update_dashboard_title(changedoc: ChangeDoc, title: string) {
    changedoc((doc) => {
        updateText(doc, ['name'], title);
    });
}

export function create_new_project(repo: Repo, changedoc: ChangeDoc, petname: string) {
    changedoc((doc) => {
        const purl = repo.create<Project>(new_project());
        doc.projects[purl.url] = { petname, order: next_project_order(doc.projects) };
    });
}

export function add_existing_project(changedoc: ChangeDoc, purl: AutomergeUrl, petname: string) {
    changedoc((doc) => {
        if (doc.projects[purl]) {
            console.log("Project already exists");
            return;
        }
        doc.projects[purl] = { petname, order: next_project_order(doc.projects) };
    });
}

export function update_project_petname(changedoc: ChangeDoc, purl: AutomergeUrl, petname: string) {
    changedoc((doc) => {
        if (!doc.projects[purl]) {
            console.log("Project does not exist");
            return;
        }
        updateText(doc.projects, [purl, 'petname'], petname);
    });
}

export function delete_project(changedoc: ChangeDoc, purl: AutomergeUrl) {
    changedoc((doc) => {
        if (!doc.projects[purl]) {
            console.log("Project does not exist");
            return;
        }
        delete doc.projects[purl];
    });
}

export function move_project(changedoc: ChangeDoc, purl: AutomergeUrl, over_url: AutomergeUrl) {
    changedoc((doc) => {
        if (purl === over_url || !doc.projects[purl] || !doc.projects[over_url]) {
            return;
        }

        const next_order = moved_order(ordered_project_entries(doc.projects), purl, over_url);
        if (next_order !== null) {
            doc.projects[purl].order = next_order;
        }
    });
}
