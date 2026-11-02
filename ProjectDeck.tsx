import { useEffect, useMemo, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { INK, ZHU, PAPER } from "./Assets.tsx"

/**
 * Project cards fanned out side by side like folders. Hovering one pulls it
 * up and pushes its neighbours aside; clicking opens its CMS page.
 * Below the mobile breakpoint it becomes a swipeable row.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function ProjectDeck(props) {
    const { projects, cardWidth, cardHeight, mobileBreakpoint, showFilters, filters } = props
    const wrapRef = useRef<HTMLDivElement>(null)
    const [W, setW] = useState(1200)
    const [hot, setHot] = useState(-1)
    const [filter, setFilter] = useState("All")
    const cardRefs = useRef<(HTMLAnchorElement | null)[]>([])

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const shown = useMemo(
        () => projects.map((p, i) => ({ ...p, i })).filter((p) => filter === "All" || (p.category || "").includes(filter)),
        [projects, filter]
    )
    const mobile = W < mobileBreakpoint
    const n = shown.length
    const cw = Math.min(cardWidth, W * 0.32)
    const step = n > 1 ? Math.min((W - cw) / (n - 1), cw * 0.8) : 0
    const offset = (W - (cw + step * (n - 1))) / 2
    const spread = hot >= 0 ? Math.min(cw + 18 - step, 220) : 0
    const mid = (n - 1) / 2

    const onMove = (e: React.PointerEvent) => {
        if (mobile || e.pointerType === "touch") return
        // stay on the raised card while the pointer is still over it
        if (hot >= 0 && cardRefs.current[hot]) {
            const hr = cardRefs.current[hot].getBoundingClientRect()
            if (e.clientX >= hr.left && e.clientX <= hr.right && e.clientY >= hr.top) return
        }
        const r = wrapRef.current.getBoundingClientRect()
        const i = Math.floor((e.clientX - r.left - offset) / step)
        setHot(Math.max(0, Math.min(n - 1, i)))
    }

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif" }}>
            {showFilters && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                    {["All", ...filters].map((f) => (
                        <button
                            key={f}
                            onClick={() => {
                                setFilter(f)
                                setHot(-1)
                            }}
                            aria-pressed={filter === f}
                            style={{
                                padding: "8px 14px",
                                borderRadius: 999,
                                border: `1px solid ${filter === f ? INK : "#d3c8b6"}`,
                                background: filter === f ? INK : "transparent",
                                color: filter === f ? PAPER : "#5a524a",
                                font: '500 12px "IBM Plex Mono", monospace',
                                cursor: "pointer",
                                transition: "all .2s",
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            )}
            <div
                ref={wrapRef}
                onPointerMove={onMove}
                onPointerLeave={() => setHot(-1)}
                style={
                    mobile
                        ? { display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", padding: "34px 0 20px" }
                        : { position: "relative", flex: 1, minHeight: cardHeight + 100 }
                }
            >
                {shown.map((p, i) => {
                    const isHot = i === hot
                    let x = offset + i * step
                    if (hot >= 0) x += i > hot ? spread / 2 : -spread / 2
                    const y = isHot ? -38 : Math.pow(i - mid, 2) * 1.4
                    const rot = isHot ? 0 : (i - mid) * 1.4
                    return (
                        <a
                            key={p.title + p.i}
                            ref={(el) => (cardRefs.current[i] = el)}
                            href={p.link}
                            onFocus={() => setHot(i)}
                            style={{
                                ...(mobile
                                    ? { position: "relative", flex: "0 0 78%", scrollSnapAlign: "center" }
                                    : {
                                          position: "absolute",
                                          left: 0,
                                          top: 60,
                                          width: cw,
                                          zIndex: i + 1,
                                          transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${isHot ? 1.04 : 1})`,
                                          transformOrigin: "50% 120%",
                                      }),
                                height: cardHeight,
                                display: "flex",
                                flexDirection: "column",
                                background: PAPER,
                                border: "1px solid #d3c8b6",
                                borderRadius: 6,
                                boxShadow: isHot ? "0 40px 60px -30px rgba(35,31,28,.55)" : "-10px 0 30px -18px rgba(35,31,28,.45)",
                                transition: "transform .55s cubic-bezier(.2,.8,.2,1), box-shadow .35s",
                                color: INK,
                                textDecoration: "none",
                            }}
                        >
                            <span
                                style={{
                                    position: "absolute", top: -26, left: 18, height: 27, padding: "0 12px",
                                    display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
                                    background: PAPER, border: "1px solid #d3c8b6", borderBottom: 0, borderRadius: "6px 6px 0 0",
                                    font: '500 11px "IBM Plex Mono", monospace', color: "#8f857a",
                                }}
                            >
                                <b style={{ color: ZHU, fontWeight: 500 }}>{String(p.i + 1).padStart(2, "0")}</b>
                                {p.tab}
                            </span>
                            <span style={{ flex: 1, margin: "10px 10px 0", overflow: "hidden", borderRadius: 3, background: "#e6dccb" }}>
                                {p.cover?.src || p.coverUrl ? (
                                    <img
                                        src={p.cover?.src || p.coverUrl}
                                        alt=""
                                        loading="lazy"
                                        style={{
                                            width: "100%", height: "100%", objectFit: "cover", display: "block",
                                            transform: isHot ? "scale(1.05)" : "none", transition: "transform .8s cubic-bezier(.2,.8,.2,1)",
                                        }}
                                    />
                                ) : (
                                    <span style={{ height: "100%", display: "grid", placeItems: "center", background: INK, color: PAPER, textAlign: "center" }}>
                                        <span>
                                            <span style={{ font: 'italic 300 44px/1 Fraunces, serif' }}>{p.title.split(" ")[0]}</span>
                                            <small style={{ display: "block", marginTop: 10, font: '500 11px "IBM Plex Mono", monospace', color: "#f0a08f" }}>{p.tab}</small>
                                        </span>
                                    </span>
                                )}
                            </span>
                            <span style={{ padding: "14px 56px 16px 16px" }}>
                                <span style={{ display: "block", font: "400 26px/1.1 Fraunces, serif" }}>{p.title}</span>
                                <span style={{ display: "block", font: '400 12px/1.4 "IBM Plex Mono", monospace', color: "#8f857a", marginTop: 6 }}>{p.kick}</span>
                            </span>
                            <span
                                aria-hidden
                                style={{
                                    position: "absolute", right: 16, bottom: 18, width: 34, height: 34, borderRadius: "50%",
                                    background: INK, color: PAPER, display: "grid", placeItems: "center",
                                    opacity: isHot || mobile ? 1 : 0, transform: isHot || mobile ? "none" : "scale(.6)",
                                    transition: "all .35s cubic-bezier(.2,.8,.2,1)",
                                }}
                            >
                                ↗
                            </span>
                        </a>
                    )
                })}
            </div>
        </div>
    )
}

const yt = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
const P = (title, tab, kick, category, slug, coverUrl = "") => ({ title, tab, kick, category, link: `/work/${slug}`, coverUrl })

ProjectDeck.defaultProps = {
    cardWidth: 320,
    cardHeight: 440,
    mobileBreakpoint: 760,
    showFilters: true,
    filters: ["Brand", "Product", "Story", "Code"],
    projects: [
        P("DoFocus", "iOS app", "A focus timer with a buddy.", "Product Brand", "dofocus", "https://y65zhu.github.io/Personal-Website-Design/dofocus-01-home.jpg"),
        P("Excel Gum", "Rebrand", "Made for Gen Z.", "Brand", "excel-gum", "https://y65zhu.github.io/ProjectsPage/mockup-set02.png"),
        P("Biblely", "Bilingual app", "Read it, then actually understand it.", "Product", "biblely"),
        P("WaterlooWorks", "UX redesign", "A fairer job posting flow.", "Product", "waterlooworks"),
        P("TryOn Buddy", "AI fashion app", "See it on you before you buy it.", "Product", "tryon-buddy"),
        P("CAN Talk", "App design", "Canadian English, for newcomers.", "Product", "can-talk", "https://y65zhu.github.io/ProjectsPage/use1.png"),
        P("AI Certificate", "Print · 2025", "An eight-page brochure for WatSPEED.", "Brand", "ai-certificate"),
        P("Antiques in Time", "Documentary", "A watchmaker, and the stories in the watches.", "Story", "antiques-in-time", yt("KOckxR6iWkQ")),
        P("Jane, Night Shift", "Audio doc", "The person who cleans the building after everyone leaves.", "Story", "jane-night-shift"),
        P("Before I Forget", "Narrative game", "A game whose interface forgets with you.", "Code Story", "before-i-forget"),
        P("Two small games", "p5.js", "My Little House & Harvest Heaven.", "Code", "two-small-games", yt("OHXPihCHsfo")),
    ],
}

addPropertyControls(ProjectDeck, {
    projects: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String },
                tab: { type: ControlType.String, title: "Tab label" },
                kick: { type: ControlType.String, title: "One-liner" },
                category: { type: ControlType.String, description: "Words matching the filters, e.g. Product Brand" },
                link: { type: ControlType.Link },
                cover: { type: ControlType.ResponsiveImage, title: "Cover" },
                coverUrl: { type: ControlType.String, title: "Cover URL", description: "Used when no Cover is uploaded" },
            },
        },
    },
    cardWidth: { type: ControlType.Number, min: 200, max: 480 },
    cardHeight: { type: ControlType.Number, min: 280, max: 640 },
    mobileBreakpoint: { type: ControlType.Number, title: "Mobile below", min: 320, max: 1200 },
    showFilters: { type: ControlType.Boolean, title: "Filters" },
    filters: { type: ControlType.Array, control: { type: ControlType.String }, hidden: (p) => !p.showFilters },
})
