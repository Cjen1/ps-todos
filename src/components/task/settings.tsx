import * as React from 'react';
import { LongPressCheckbox } from '@/components/ui/long-press-checkbox';
import { RepeatTask, update_repeat_task_duration, update_repeat_task_type, update_task_completed } from './store';
import { useDocument } from '@automerge/automerge-repo-react-hooks';
import { Project } from '@/components/project/store';
import { AutomergeUrl } from '@automerge/automerge-repo';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export const Settings: React.FC<{
  project_url: AutomergeUrl,
  task_url: AutomergeUrl,
}> = ({ project_url, task_url }) => {
  const [project, changeDoc] = useDocument<Project>(project_url);
  if (!project?.tasks[task_url]) {
    return <div>Error: url invalid {project_url}</div>
  }

  const task = project.tasks[task_url].task;

  const [openSettings, setOpenSettings] = React.useState(false);

  return (
    <Dialog open={openSettings} onOpenChange={setOpenSettings}>
      <LongPressCheckbox
        onShortPress={() => { update_task_completed(changeDoc, task_url, task.completed ? null : Date.now()) }}
        onLongPress={() => { setOpenSettings(true) }}
        checked={task.completed !== null ? true : false}
      />
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Task Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 px-2">
          <Separator />
          <Label>Repeat</Label>
          <select
            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            value={task.repeat?.kind ?? 'none'}
            onChange={(event) => {
              const value = event.target.value as "none" | "incomplete-after";
              update_repeat_task_type(changeDoc, task_url, value);
            }}>
            <option
              value="none">
              None
            </option>
            <option
              value="incomplete-after">
              Incomplete After
            </option>
          </select>
          {task.repeat && task.repeat.kind === 'incomplete-after' && (
            <div className="flex flex-row">
              <Input
                type="number"
                min="0"
                value={task.repeat.duration}
                onChange={(event) => update_repeat_task_duration(changeDoc, task_url, Number(event.target.value))} />
              <Label>days</Label>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}