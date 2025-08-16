import { useEffect, useMemo, useRef, useState } from "react";

interface AsciiSidebarProps {
  madnessLevel: number;
  isPaused: boolean;
  isGenerating: boolean;
}

// Utility: clamp number between min and max
const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

// Utility: smooth random walk for nicer values
const useSmoothedRandom = (initial: number, step: number, min = 0, max = 100) => {
  const [value, setValue] = useState<number>(initial);
  const rafRef = useRef<number | null>(null);
  const directionRef = useRef<number>(Math.random() > 0.5 ? 1 : -1);

  useEffect(() => {
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      const drift = (Math.random() - 0.5) * step;
      const next = clamp(value + (directionRef.current * step * dt) / 1200 + drift, min, max);
      if (next === max || next === min) directionRef.current *= -1;
      setValue(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
};

// Panel: Rotating orbital around a core
const Orbital: React.FC<{ speedMs: number; intensity: number }> = ({ speedMs, intensity }) => {
  const frames = useMemo(() => {
    // 9x9 ring frames with a moving satellite
    const base = [
      "    ***    ",
      "  *     *  ",
      " *       * ",
      "*         *",
      "*    @    *",
      "*         *",
      " *       * ",
      "  *     *  ",
      "    ***    ",
    ];
    const points = [
      [0, 4],
      [1, 6],
      [3, 8],
      [4, 9],
      [5, 8],
      [7, 6],
      [8, 4],
      [7, 2],
      [5, 0],
      [4, -1],
      [3, 0],
      [1, 2],
    ];
    const f: string[] = [];
    for (let i = 0; i < points.length; i++) {
      const grid = base.map((row) => row.split(""));
      const [r, c] = points[i];
      const rr = clamp(r, 0, grid.length - 1);
      const cc = clamp(c, 0, grid[0].length - 1);
      grid[rr][cc] = intensity > 60 ? "●" : "o";
      f.push(grid.map((row) => row.join("")).join("\n"));
    }
    return f;
  }, [intensity]);

  const [idx, setIdx] = useState<number>(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % frames.length), Math.max(60, speedMs));
    return () => clearInterval(id);
  }, [frames.length, speedMs]);

  return (
    <pre className="text-green-400/90 leading-[1.05] whitespace-pre font-mono text-[10px] md:text-[11px]">
      {frames[idx]}
    </pre>
  );
};

// Panel: Equalizer bars
const Equalizer: React.FC<{ bands: number; intensity: number }> = ({ bands, intensity }) => {
  const [values, setValues] = useState<number[]>(() => new Array(bands).fill(0));
  useEffect(() => {
    const id = setInterval(() => {
      setValues((prev) => prev.map((v, i) => {
        const jitter = (Math.sin(Date.now() / (220 + i * 13)) + 1) * 0.5 * 60;
        const noise = Math.random() * (intensity * 0.4);
        return clamp(v * 0.6 + jitter * 0.3 + noise * 0.1, 5, 100);
      }));
    }, 90);
    return () => clearInterval(id);
  }, [intensity]);

  const rows = 8;
  const chars = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const grid: string[] = [];
  for (let r = rows - 1; r >= 0; r--) {
    const line = values
      .map((v, i) => {
        const level = Math.round((v / 100) * rows);
        const ch = chars[clamp(level, 0, chars.length - 1)];
        const accent = (i % 4 === 0 && r === rows - 1) ? "·" : ch;
        return accent;
      })
      .join(" ");
    grid.push(line);
  }

  return (
    <pre className="text-green-400/90 whitespace-pre leading-[1.05] font-mono text-[10px] md:text-[11px]">
      {grid.join("\n")}
    </pre>
  );
};

// Panel: Glitching terminal noise / matrix-ish rain
const MatrixNoise: React.FC<{ width: number; height: number; speedMs: number; intensity: number }>
  = ({ width, height, speedMs, intensity }) => {
  const glyphs = useMemo(() => "01░▒▓X*+><[]{}$#@".split(""), []);
  const [grid, setGrid] = useState<string[]>(() => new Array(height).fill("").map(() => "".padEnd(width, " ")));

  useEffect(() => {
    const id = setInterval(() => {
      setGrid((prev) => {
        const next: string[] = [];
        for (let r = 0; r < height; r++) {
          let row = "";
          for (let c = 0; c < width; c++) {
            const flip = Math.random() < (0.05 + intensity / 300);
            if (flip) {
              row += glyphs[Math.floor(Math.random() * glyphs.length)];
            } else {
              // keep some persistence
              row += prev[r]?.[c] ?? " ";
            }
          }
          next.push(row);
        }
        // occasional rain columns
        if (Math.random() < 0.35) {
          const col = Math.floor(Math.random() * width);
          for (let r = 0; r < height; r++) {
            const ch = glyphs[(r + Date.now()) % glyphs.length] ?? "1";
            const line = next[r].split("");
            line[col] = ch;
            next[r] = line.join("");
          }
        }
        return next;
      });
    }, Math.max(60, speedMs));
    return () => clearInterval(id);
  }, [glyphs, height, speedMs, width, intensity]);

  return (
    <pre className="text-green-500/70 whitespace-pre leading-[1.05] font-mono text-[10px] md:text-[11px]">
      {grid.join("\n")}
    </pre>
  );
};

// Panel: System metrics (fake) with ASCII bars
const SystemMetrics: React.FC<{ madness: number; paused: boolean }> = ({ madness, paused }) => {
  const cpu = useSmoothedRandom(30 + madness * 0.2, 0.05);
  const mem = useSmoothedRandom(40 + madness * 0.3, 0.04);
  const gpu = useSmoothedRandom(25 + madness * 0.5, 0.06);

  const makeBar = (value: number, length = 18) => {
    const filled = Math.round((value / 100) * length);
    const empty = length - filled;
    return `${"█".repeat(filled)}${"·".repeat(empty)}`;
  };

  return (
    <div className="space-y-1 font-mono text-[11px]">
      <div className="flex items-center justify-between text-green-400/80">
        <span>CPU</span>
        <span className="text-green-500/60">{Math.round(cpu)}%</span>
      </div>
      <pre className="text-green-400/90">{makeBar(cpu)}</pre>
      <div className="flex items-center justify-between text-green-400/80">
        <span>MEM</span>
        <span className="text-green-500/60">{Math.round(mem)}%</span>
      </div>
      <pre className="text-green-400/90">{makeBar(mem)}</pre>
      <div className="flex items-center justify-between text-green-400/80">
        <span>GPU</span>
        <span className="text-green-500/60">{Math.round(gpu)}%</span>
      </div>
      <pre className="text-green-400/90">{makeBar(gpu)}</pre>
      <div className="text-green-500/50 text-[10px] uppercase tracking-wider">
        {paused ? "state: suspended" : "state: fragmenting"}
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-green-500/70 font-mono text-[10px] tracking-wider uppercase mb-1">
    {title}
  </div>
);

const Divider: React.FC = () => (
  <div className="border-t border-green-500/20 my-3" />
);

const AsciiSidebar: React.FC<AsciiSidebarProps> = ({ madnessLevel, isPaused, isGenerating }) => {
  return (
    <aside
      className="hidden md:flex w-72 xl:w-80 shrink-0 flex-col border-l border-green-500/20 bg-black/60 backdrop-blur-[1px]"
      style={{ textShadow: "0 0 4px rgba(34, 197, 94, 0.45)" }}
    >
      <div className="p-3 overflow-y-auto">
        <SectionHeader title="orbital telemetry" />
        <div className="bg-black/40 p-2 border border-green-500/20">
          <Orbital speedMs={120 - Math.min(60, Math.floor(madnessLevel / 2))} intensity={madnessLevel} />
        </div>

        <Divider />

        <SectionHeader title="signal analyzer" />
        <div className="bg-black/40 p-2 border border-green-500/20">
          <Equalizer bands={18} intensity={madnessLevel} />
        </div>

        <Divider />

        <SectionHeader title="matrix noise" />
        <div className="bg-black/40 p-2 border border-green-500/20">
          <MatrixNoise width={26} height={8} speedMs={isGenerating ? 80 : 140} intensity={madnessLevel} />
        </div>

        <Divider />

        <SectionHeader title="system metrics" />
        <div className="bg-black/40 p-2 border border-green-500/20">
          <SystemMetrics madness={madnessLevel} paused={isPaused} />
        </div>
      </div>
    </aside>
  );
};

export default AsciiSidebar;


