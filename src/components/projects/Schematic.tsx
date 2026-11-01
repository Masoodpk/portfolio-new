import type { SchematicKind } from "@/content/projects";

/**
 * Simplified, hand-drawn-in-code interface schematics. They illustrate feature
 * areas without reproducing any confidential production UI or data.
 */
export function Schematic({ kind }: { kind: SchematicKind }) {
  return (
    <div className="flex aspect-[16/10] w-full bg-ink text-[0px]" aria-hidden="true">
      <Sidebar active={kind} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="min-h-0 flex-1 p-[3%]">
          {kind === "dashboard" ? <Dashboard /> : kind === "campaigns" ? <Campaigns /> : <Inbox />}
        </div>
      </div>
    </div>
  );
}

const bar = "rounded-[2px] bg-line";
const barStrong = "rounded-[2px] bg-line-strong";

function Sidebar({ active }: { active: SchematicKind }) {
  const items: (SchematicKind | null)[] = ["dashboard", "campaigns", "inbox", null, null];
  return (
    <div className="flex w-[13%] flex-col gap-[6%] border-r border-line bg-ink-raised px-[2.5%] py-[4%]">
      <div className="mb-[8%] h-[4%] w-1/2 rounded-[2px] bg-accent" />
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-[10%]">
          <div className={`aspect-square w-[18%] rounded-[2px] ${item === active ? "bg-accent" : "bg-line-strong"}`} />
          <div className={`h-[0.35rem] flex-1 ${item === active ? "rounded-[2px] bg-fg/70" : bar}`} />
        </div>
      ))}
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex h-[10%] items-center justify-between border-b border-line px-[3%]">
      <div className={`h-[22%] w-[22%] ${barStrong}`} />
      <div className="flex h-full items-center gap-[0.6rem]">
        <div className={`h-[40%] w-[5rem] ${bar}`} />
        <div className="aspect-square h-[45%] rounded-full bg-line-strong" />
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="grid h-full grid-cols-4 grid-rows-[auto_1fr_auto] gap-[3%]">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col justify-between gap-2 border border-line bg-panel p-[8%]">
          <div className={`h-[0.3rem] w-1/2 ${bar}`} />
          <div className={`h-[0.7rem] w-3/4 ${i === 0 ? "rounded-[2px] bg-accent" : barStrong}`} />
        </div>
      ))}
      <div className="col-span-3 border border-line bg-panel p-[3%]">
        <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="size-full">
          <path d="M0 80 L40 70 L80 74 L120 50 L160 56 L200 34 L240 40 L300 18" fill="none" stroke="#ff5f1f" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path d="M0 90 L40 86 L80 88 L120 76 L160 80 L200 66 L240 70 L300 58" fill="none" stroke="#3a3a40" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="flex flex-col gap-[8%] border border-line bg-panel p-[8%]">
        {[0.9, 0.6, 0.75, 0.45].map((w, i) => (
          <div key={i} className={`h-[0.35rem] ${bar}`} style={{ width: `${w * 100}%` }} />
        ))}
      </div>
      <div className="col-span-4 flex flex-col gap-[0.45rem] border border-line bg-panel p-[2%]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-[3%]">
            <div className="aspect-square w-[1.5%] rounded-full bg-line-strong" />
            <div className={`h-[0.3rem] w-[25%] ${bar}`} />
            <div className={`h-[0.3rem] w-[15%] ${bar}`} />
            <div className={`ml-auto h-[0.3rem] w-[8%] ${i === 1 ? "rounded-[2px] bg-accent/70" : barStrong}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Campaigns() {
  const channels = ["SMS", "Voicemail", "Email", "SMS"];
  return (
    <div className="grid h-full grid-cols-[1.4fr_1fr] gap-[3%]">
      <div className="flex flex-col gap-[4%] border border-line bg-panel p-[3%]">
        <div className="flex items-center justify-between">
          <div className={`h-[0.4rem] w-1/3 ${barStrong}`} />
          <div className="h-[0.9rem] w-[18%] rounded-[2px] bg-accent" />
        </div>
        {channels.map((channel, i) => (
          <div key={i} className="flex items-center gap-[4%] border-t border-line pt-[3%]">
            <div className={`size-[0.45rem] shrink-0 rounded-full ${i === 0 ? "bg-accent" : "bg-line-strong"}`} />
            <div className={`h-[0.3rem] w-[38%] ${bar}`} />
            <span className="label-mono ml-auto border border-line px-1.5 py-0.5 text-[0.5rem] leading-none text-subtle">
              {channel}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-[6%] border border-line bg-panel p-[5%]">
        <div className="flex items-center gap-[6%]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-1 items-center gap-[8%]">
              <div className={`aspect-square w-[22%] rounded-full ${i === 0 ? "bg-accent" : "border border-line-strong"}`} />
              <div className={`h-[0.25rem] flex-1 ${i === 0 ? "rounded-[2px] bg-fg/60" : bar}`} />
            </div>
          ))}
        </div>
        <div className={`h-[0.3rem] w-1/2 ${barStrong}`} />
        <div className="h-[22%] border border-line" />
        <div className={`h-[0.3rem] w-2/3 ${bar}`} />
        <div className="h-[14%] border border-line" />
        <div className="mt-auto h-[0.9rem] w-1/3 self-end rounded-[2px] bg-fg/80" />
      </div>
    </div>
  );
}

function Inbox() {
  return (
    <div className="grid h-full grid-cols-[1fr_2fr] border border-line bg-panel">
      <div className="flex flex-col border-r border-line">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex items-center gap-[6%] border-b border-line p-[6%] ${i === 1 ? "bg-ink-raised" : ""}`}
          >
            <div className="aspect-square w-[14%] shrink-0 rounded-full bg-line-strong" />
            <div className="flex flex-1 flex-col gap-[0.3rem]">
              <div className={`h-[0.3rem] w-2/3 ${i === 1 ? "rounded-[2px] bg-fg/70" : barStrong}`} />
              <div className={`h-[0.25rem] w-full ${bar}`} />
            </div>
            {i < 2 ? <div className="size-[0.4rem] shrink-0 rounded-full bg-accent" /> : null}
          </div>
        ))}
      </div>
      <div className="flex flex-col p-[4%]">
        <div className="flex flex-1 flex-col justify-end gap-[4%]">
          {[
            { mine: false, w: "55%" },
            { mine: true, w: "45%" },
            { mine: false, w: "35%" },
            { mine: true, w: "60%" },
          ].map((m, i) => (
            <div
              key={i}
              className={`h-[11%] rounded-[3px] ${m.mine ? "self-end bg-accent/80" : "self-start bg-line-strong"}`}
              style={{ width: m.w }}
            />
          ))}
        </div>
        <div className="mt-[5%] flex items-center gap-[3%] border border-line p-[2.5%]">
          <div className={`h-[0.3rem] flex-1 ${bar}`} />
          <div className="h-[0.9rem] w-[12%] rounded-[2px] bg-accent" />
        </div>
      </div>
    </div>
  );
}
