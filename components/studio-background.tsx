'use client'

export function StudioBackground() {
  return (
    <div
      aria-hidden="true"
      className="studio-hardware-background pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="studio-hardware-background__base absolute inset-0" />
      <div className="studio-hardware-background__reflection studio-hardware-background__reflection--amber absolute inset-0" />
      <div className="studio-hardware-background__reflection studio-hardware-background__reflection--green absolute inset-0" />
      <div className="studio-hardware-background__brushed-metal absolute inset-0" />

      <svg
        className="studio-hardware-background__traces absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="studio-pcb-traces"
            x="0"
            y="0"
            width="420"
            height="360"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 72h96v54h74v72h118M268 0v48h76v90h76M420 274h-88v-48h-92v94H118v40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle cx="96" cy="72" r="2" fill="currentColor" />
            <circle cx="170" cy="126" r="2" fill="currentColor" />
            <circle cx="344" cy="48" r="2" fill="currentColor" />
            <circle cx="332" cy="226" r="2" fill="currentColor" />
            <circle cx="240" cy="320" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#studio-pcb-traces)" />
      </svg>

      <div className="studio-hardware-background__vignette absolute inset-0" />

      <style jsx global>{`
        .studio-hardware-background {
          background: #e7e4da;
          color: rgba(132, 101, 36, 0.12);
        }

        .studio-hardware-background__base {
          background: linear-gradient(
              112deg,
              rgba(255, 255, 255, 0.62) 0%,
              transparent 32%
            ),
            linear-gradient(165deg, #efede5 0%, #e2dfd5 46%, #d6d4cb 100%);
        }

        .studio-hardware-background__reflection--amber {
          background: radial-gradient(
            ellipse 48% 34% at 8% 2%,
            rgba(185, 142, 47, 0.1),
            transparent 72%
          );
        }

        .studio-hardware-background__reflection--green {
          background: radial-gradient(
            ellipse 38% 30% at 96% 90%,
            rgba(83, 126, 76, 0.055),
            transparent 72%
          );
        }

        .studio-hardware-background__brushed-metal {
          opacity: 0.55;
          background-image: repeating-linear-gradient(
              0deg,
              rgba(71, 68, 58, 0.018) 0,
              rgba(71, 68, 58, 0.018) 1px,
              transparent 1px,
              transparent 4px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.12) 0,
              rgba(255, 255, 255, 0.12) 1px,
              transparent 1px,
              transparent 9px
            );
        }

        .studio-hardware-background__traces {
          opacity: 0.38;
        }

        .studio-hardware-background__vignette {
          background: radial-gradient(
            ellipse at center,
            transparent 35%,
            rgba(72, 69, 60, 0.07) 100%
          );
        }

        .dark .studio-hardware-background {
          background: #101210;
          color: rgba(214, 169, 72, 0.13);
        }

        .dark .studio-hardware-background__base {
          background: linear-gradient(
              122deg,
              rgba(83, 86, 75, 0.12) 0%,
              transparent 30%
            ),
            linear-gradient(158deg, #1d201c 0%, #141714 48%, #0d0f0e 100%);
        }

        .dark .studio-hardware-background__reflection--amber {
          background: radial-gradient(
            ellipse 46% 30% at 6% 0%,
            rgba(213, 161, 61, 0.105),
            transparent 72%
          );
        }

        .dark .studio-hardware-background__reflection--green {
          background: radial-gradient(
            ellipse 42% 32% at 100% 96%,
            rgba(93, 141, 81, 0.075),
            transparent 74%
          );
        }

        .dark .studio-hardware-background__brushed-metal {
          opacity: 0.7;
          background-image: repeating-linear-gradient(
              0deg,
              rgba(224, 226, 211, 0.018) 0,
              rgba(224, 226, 211, 0.018) 1px,
              transparent 1px,
              transparent 4px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.1) 0,
              rgba(0, 0, 0, 0.1) 1px,
              transparent 1px,
              transparent 11px
            );
        }

        .dark .studio-hardware-background__traces {
          opacity: 0.5;
        }

        .dark .studio-hardware-background__vignette {
          background: radial-gradient(
            ellipse at center,
            transparent 38%,
            rgba(0, 0, 0, 0.33) 100%
          );
        }
      `}</style>
    </div>
  )
}
