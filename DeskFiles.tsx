import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { loadDanXing, INK, ZHU, PAPER } from "./Assets.tsx"

/**
 * A messy computer desktop: draggable "files" that open a small window
 * with a note about Annora when clicked. Meant to sit under PeelReveal.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function DeskFiles(props) {
    const { files, background } = props
    const deskRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(-1)
    const [pos, setPos] = useState<Record<number, { x: number; y: number }>>({})
    const [z, setZ] = useState<Record<number, number>>({})
    const top = useRef(10)
    const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null)

    useEffect(() => {
        loadDanXing()
    }, [])

    const down = (i: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
        const el = e.currentTarget
        drag.current = { i, sx: e.clientX, sy: e.clientY, ox: el.offsetLeft, oy: el.offsetTop, moved: false }
        el.setPointerCapture(e.pointerId)
    }
    const move = (e: React.PointerEvent) => {
        const d = drag.current
        if (!d) return
        const dx = e.clientX - d.sx, dy = e.clientY - d.sy
        if (!d.moved && Math.hypot(dx, dy) < 5) return
        if (!d.moved) setZ((s) => ({ ...s, [d.i]: ++top.current }))
        d.moved = true
        setPos((s) => ({ ...s, [d.i]: { x: d.ox + dx, y: d.oy + dy } }))
    }
    const up = (i: number) => () => {
        const d = drag.current
        drag.current = null
        if (d && !d.moved) setOpen(i)
    }

    const icon = (f) => {
        const base: React.CSSProperties = {
            width: 64, height: 76, borderRadius: 6, background: "#fff", display: "grid", placeItems: "center",
            fontSize: 26, color: "#5a524a", boxShadow: "0 6px 12px -6px rgba(0,0,0,.4)",
        }
        switch (f.kind) {
            case "folder":
                return <span style={{ ...base, width: 80, height: 62, background: "linear-gradient(#7cc0f2, #4d9fe0)", borderRadius: "4px 10px 6px 6px" }} />
            case "image":
                return <span style={{ ...base, backgroundImage: `url(${f.image?.src})`, backgroundSize: "cover", backgroundPosition: "center", border: "3px solid #fff" }} />
            case "sheet":
                return <span style={{ ...base, background: "#fff linear-gradient(#2e8b57,#2e8b57) top / 100% 12px no-repeat" }}>▦</span>
            case "ink":
                return <span style={{ ...base, font: "40px DanXing, serif", color: INK }}>墨</span>
            case "star":
                return <span style={{ ...base, color: ZHU, background: "#fff3ef" }}>✦</span>
            case "play":
                return <span style={base}>▶</span>
            case "moon":
                return <span style={base}>☾</span>
            default:
                return <span style={base}>≡</span>
        }
    }
    const current = files[open]

    return (
        <div
            ref={deskRef}
            onPointerMove={move}
            style={{
                position: "relative", width: "100%", height: "100%", overflow: "hidden",
                backgroundColor: background,
                backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(90,60,30,.18) 0 1px, transparent 1px 64px), repeating-linear-gradient(90deg, rgba(90,60,30,.10) 0 1px, transparent 1px 220px)",
            }}
        >
            {files.map((f, i) => (
                <button
                    key={f.name + i}
                    onPointerDown={down(i)}
                    onPointerUp={up(i)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(i)}
                    style={{
                        position: "absolute",
                        left: pos[i] ? pos[i].x : `${f.x}%`,
                        top: pos[i] ? pos[i].y : `${f.y}%`,
                        zIndex: z[i] || 1,
                        width: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        background: "none", border: 0, cursor: "pointer", touchAction: "none", userSelect: "none",
                    }}
                >
                    {icon(f)}
                    <span
                        style={{
                            font: "500 12px/1.3 Inter, sans-serif", color: "#fff", textAlign: "center", padding: "2px 6px", borderRadius: 4,
                            textShadow: open === i ? "none" : "0 1px 3px rgba(0,0,0,.6)", background: open === i ? "#2f6fd6" : "none",
                        }}
                    >
                        {f.name}
                    </span>
                </button>
            ))}
            {current && (
                <div
                    role="dialog"
                    aria-label={current.name}
                    style={{
                        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(380px, 86%)",
                        zIndex: 1000, background: PAPER, borderRadius: 10, overflow: "hidden",
                        boxShadow: "0 30px 60px -20px rgba(0,0,0,.5), 0 0 0 1px rgba(0,0,0,.08)",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#e6dccb", color: "#5a524a", font: '12px "IBM Plex Mono", monospace' }}>
                        {current.name}
                        <button onClick={() => setOpen(-1)} aria-label="Close" style={{ border: 0, background: "none", fontSize: 20, cursor: "pointer", color: "inherit" }}>
                            ×
                        </button>
                    </div>
                    {current.kind === "image" && current.image?.src && (
                        <img src={current.image.src} alt={current.name} style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
                    )}
                    <p style={{ margin: 0, padding: 20, font: "400 21px/1.35 Fraunces, serif", color: INK }}>{current.body}</p>
                </div>
            )}
        </div>
    )
}

const F = (name, kind, x, y, body) => ({ name, kind, x, y, body })

DeskFiles.defaultProps = {
    background: "#c9a77c",
    files: [
        F("advice-taken.log", "star", 5, 8, "My friends say I'm the most coachable person they know. Give me good feedback and I'll put my ego aside and act on it — usually the same day."),
        F("nail-set-v12.jpg", "image", 28, 4, "I do nails. Ten tiny canvases, no undo button."),
        F("hello-kitty/", "folder", 52, 12, "Lifelong, unapologetic fan. My room is mostly her at this point. (This folder is 4.2 GB.)"),
        F("still-can-do-the-splits.mov", "play", 76, 6, "Years of Chinese folk dance, since I was a kid. Yes — I can still do the splits."),
        F("ink-practice.jpg", "ink", 12, 50, "Years of Chinese calligraphy and ink painting. I still practice — it's where all the white space on this site comes from."),
        F("born-to-cook.txt", "doc", 36, 56, "Friends say I was born with a 'rice root' — a natural gift for cooking. Come hungry."),
        F("gym-streak.xlsx", "sheet", 59, 48, "At the gym most days. Discipline I can actually see."),
        F("birth-chart.pdf", "moon", 80, 54, "Western astrology and a firm belief in manifesting. This website was — partly — manifested."),
        F("no-pet-yet.txt", "doc", 46, 78, "A pet is a real responsibility. I'm waiting until I can give one a steady life."),
    ],
}

addPropertyControls(DeskFiles, {
    files: {
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                name: { type: ControlType.String },
                kind: { type: ControlType.Enum, options: ["doc", "folder", "image", "sheet", "ink", "star", "play", "moon"] },
                image: { type: ControlType.ResponsiveImage, hidden: (f) => f.kind !== "image" },
                body: { type: ControlType.String, displayTextArea: true },
                x: { type: ControlType.Number, title: "Left %", min: 0, max: 95 },
                y: { type: ControlType.Number, title: "Top %", min: 0, max: 95 },
            },
        },
    },
    background: { type: ControlType.Color },
})
