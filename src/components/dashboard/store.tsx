import { Repo, type AutomergeUrl, updateText, ChangeFn } from '@automerge/react'
import { Project, new_project } from "@/components/project/store";

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
    return Object.entries(projects).map(([project_url, project], index) => {
        return {
            project_url: project_url as AutomergeUrl,
            order: project.order ?? index,
        };
    }).sort((a, b) => a.order - b.order);
}

function next_project_order(projects: Dashboard["projects"]) {
    const ordered_projects = ordered_project_entries(projects);
    if (ordered_projects.length === 0) {
        return 0;
    }
    return ordered_projects[ordered_projects.length - 1].order + 1;
}

function calculate_next_order(prev_order: number | null, next_order: number | null) {
    if (prev_order === null && next_order === null) {
        return 0;
    }
    if (prev_order === null) {
        return (next_order as number) - 1;
    }
    if (next_order === null) {
        return prev_order + 1;
    }
    return prev_order + ((next_order - prev_order) / 2);
}

export function ordered_project_urls(dashboard: Dashboard) {
    return ordered_project_entries(dashboard.projects).map(({ project_url }) => project_url);
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

        const sorted_projects = ordered_project_entries(doc.projects);
        const active_idx = sorted_projects.findIndex((project) => project.project_url === purl);
        const over_idx = sorted_projects.findIndex((project) => project.project_url === over_url);

        if (active_idx === -1 || over_idx === -1) {
            return;
        }

        const sorted_without_active = sorted_projects.filter((project) => project.project_url !== purl);
        const prev_order = sorted_without_active[over_idx - 1]?.order ?? null;
        const next_order = sorted_without_active[over_idx]?.order ?? null;

        doc.projects[purl].order = calculate_next_order(prev_order, next_order);
    });
}
