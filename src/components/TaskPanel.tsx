import type { TaskItem } from "@/types";

type TaskPanelProps = {
  tasks: TaskItem[];
};

export function TaskPanel({ tasks }: TaskPanelProps) {
  return (
    <section className="pixel-panel bg-slate-900 p-3 text-white">
      <div className="mb-3 flex items-center justify-between border-b-2 border-slate-700 pb-2 font-pixel text-xs font-bold">
        <span>Tasks</span>
        <span className="text-blue-300">{tasks.filter((task) => task.completed).length}/{tasks.length}</span>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`flex items-center gap-2 rounded-md border-2 px-2.5 py-2 font-pixel text-xs ${
              task.completed
                ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                : "border-slate-700 bg-slate-800 text-slate-400"
            }`}
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center border-2 ${
                task.completed ? "border-emerald-300 bg-emerald-500 text-slate-950" : "border-slate-500"
              }`}
            >
              {task.completed ? "✓" : ""}
            </span>
            <span>{task.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
