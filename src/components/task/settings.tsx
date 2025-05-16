import * as React from 'react';
import { LongPressCheckbox } from '@/components/ui/long-press-checkbox';
import { update_repeat_task_duration, update_repeat_task_type, update_task_completed } from './store';
import { useDocument } from '@automerge/automerge-repo-react-hooks';
import { Project, ChangeDoc } from '@/components/project/store';
import { AutomergeUrl } from '@automerge/automerge-repo';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const if_expired_uncheck = (task_url: AutomergeUrl, project: Project, changeDoc: ChangeDoc) => {
  const task = project.tasks[task_url];
  if (!task?.task) return;
  if (task.task.repeat == undefined) {
    changeDoc((doc) => { doc.tasks[task_url].task.repeat = { kind: 'none' } });
    return;
  }
  if (task.task.repeat.kind === 'incomplete-after' && task.task.completed !== null) {
    const now = Date.now();
    const completed = task.task.completed;
    // Uncheck several hours before the task is due for better UX
    const duration_ms = (task.task.repeat.duration - 0.3) * 24 * 60 * 60 * 1000;
    const timeout = completed + duration_ms;
    if (timeout < now) {
      changeDoc((doc) => {
        doc.tasks[task_url].task.completed = null;
      });
    }
  }
};

export const Settings: React.FC<{
  project_url: AutomergeUrl,
  task_url: AutomergeUrl,
}> = ({ project_url, task_url }) => {
  const [project, changeDoc] = useDocument<Project>(project_url);
  if (!project?.tasks[task_url]) {
    return <div>Error: url invalid {project_url}</div>
  }

  const task = project.tasks[task_url].task;

  React.useEffect(() => {
    const interval = setInterval(() => {
      if_expired_uncheck(task_url, project, changeDoc);
    }, 1000);
    return () => clearInterval(interval);
  }, [task_url, project]);

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
          <Select
            value={task.repeat?.kind ?? 'none'}
            onValueChange={(value) => {
              if (value == 'none' || value == 'incomplete-after') {
                update_repeat_task_type(changeDoc, task_url, value);
              }
            }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="incomplete-after">Incomplete After</SelectItem>
            </SelectContent>
          </Select>
          {task.repeat && task.repeat.kind === 'incomplete-after' && (
            <div className="flex flex-row gap-2">
              <Input
                type="number"
                min="0"
                value={task.repeat.duration}
                onChange={(event) => update_repeat_task_duration(changeDoc, task_url, Number(event.target.value))} />
              <Label>
                days
              </Label>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}