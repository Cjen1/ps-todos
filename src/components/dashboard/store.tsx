import {type AutomergeUrl, generateAutomergeUrl} from '@automerge/automerge-repo'
import { updateText } from '@automerge/automerge/next'
import { ChangeFn, ChangeOptions} from "@automerge/automerge/slim/next"

export type ProjectMetadata = {
  petname: string;
};

export type Dashboard = {
    name: string;
    projects: { [key: AutomergeUrl]: ProjectMetadata };
};

type ChangeDoc = (changeFn : ChangeFn<Dashboard>, options?: ChangeOptions<Dashboard>) => void;

export function update_dashboard_title(changedoc: ChangeDoc, title: string) {
    changedoc((doc) => {
        updateText(doc, ['name'], title);
    });
}

export function create_new_project(changedoc: ChangeDoc, petname: string) {
    changedoc((doc) => {
        const purl = generateAutomergeUrl();
        doc.projects[purl] = { petname };
    });
}

export function add_existing_project(changedoc: ChangeDoc, purl: AutomergeUrl, petname: string) {
    changedoc((doc) => {
        if (doc.projects[purl]) {
            console.log("Project already exists");
            return;
        }
        doc.projects[purl] = { petname };
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
        if(!doc.projects[purl]){
            console.log("Project does not exist");
            return;
        }
        delete doc.projects[purl];
    });
}