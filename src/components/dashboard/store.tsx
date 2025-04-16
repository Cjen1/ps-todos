import {type AutomergeUrl, generateAutomergeUrl} from '@automerge/automerge-repo'
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import { updateText } from '@automerge/automerge/next'
import { ChangeFn, ChangeOptions, Doc } from "@automerge/automerge/slim/next"
import { pathToFileURL } from 'url';

export type ProjectMetadata = {
  petname: string;
};

export type Dashboard = {
    name: string;
    projects: Map<AutomergeUrl, ProjectMetadata>;
};

type ChangeDoc = (changeFn : ChangeFn<Dashboard>, options?: ChangeOptions<Dashboard>) => void;

export function update_dashboard_title(changedoc: ChangeDoc, title: string) {
    changedoc((doc) => {
        updateText(doc, ['name'], title);
    });
}

export function add_existing_project(changedoc: ChangeDoc, purl: AutomergeUrl, petname: string) {
    changedoc((doc) => {
        if (doc.projects.has(purl)) {
            console.log("Project already exists");
            return;
        }
        doc.projects.set(purl, { petname } as ProjectMetadata);
    });
}

export function create_new_project(changedoc: ChangeDoc, petname: string) {
    changedoc((doc) => {
        const purl = generateAutomergeUrl();
        doc.projects.set(purl, {petname} as ProjectMetadata);
    });
}

export function update_project_petname(changedoc: ChangeDoc, purl: AutomergeUrl, petname: string) {
    changedoc((doc) => {
        if (!doc.projects.has(purl)) {
            console.log("Project does not exist");
            return;
        }
        updateText(doc.projects, [purl, 'petname'], petname);
    });
}

export function delete_project(changedoc: ChangeDoc, purl: AutomergeUrl) {
    changedoc((doc) => {
        if (!doc.projects.has(purl)) {
            console.log("Project does not exist");
            return;
        }
        doc.projects.delete(purl);
    });
}