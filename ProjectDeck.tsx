import { useEffect, useMemo, useRef, useState } from "react"
import * as Framer from "framer"
import { addPropertyControls, ControlType } from "framer"
import { useSiteFonts } from "./HomeHero.tsx"
import { INK, ZHU, PAPER } from "./Assets.tsx"

/**
 * Project cards fanned out side by side like folders. Hovering one pulls it
 * up and pushes its neighbours aside; clicking opens its CMS page. At rest
 * the featured card is raised. A sideways trackpad swipe or the arrow keys
 * move exactly one card. Below the mobile breakpoint it becomes a
 * swipeable row that stops on every card.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
// Framer's router isn't in the public typings, but it's there at runtime.
// A plain <a href="/work/x"> 404s inside Framer preview, so we navigate
// through the router whenever it's available.
const useFramerRouter: () => any = (Framer as any).useRouter || (() => null)

function findRoute(router, path: string) {
    if (!router?.routes) return null
    const parts = path.split("?")[0].split("#")[0].split("/").filter(Boolean)
    for (const [id, r] of Object.entries<any>(router.routes)) {
        const rp = (r.path || "").split("/").filter(Boolean)
        if (rp.length !== parts.length) continue
        const vars: Record<string, string> = {}
        if (rp.every((seg, k) => (seg.startsWith(":") ? ((vars[seg.slice(1)] = parts[k]), true) : seg === parts[k]))) {
            return { id, vars }
        }
    }
    return null
}

export default function ProjectDeck(props) {
    const { projects, cardWidth, cardHeight, mobileBreakpoint, showFilters, filters, featured } = props
    const rootRef = useRef<HTMLDivElement>(null)
    const wrapRef = useRef<HTMLDivElement>(null)
    const [W, setW] = useState(1200)
    const [hot, setHot] = useState(-1)
    const [filter, setFilter] = useState("All")
    const cardRefs = useRef<(HTMLAnchorElement | null)[]>([])
    const router = useFramerRouter()
    useSiteFonts()

    const go = (e: React.MouseEvent, link: string) => {
        if (!link || !link.startsWith("/") || e.metaKey || e.ctrlKey) return
        const hit = findRoute(router, link)
        if (!hit) return
        e.preventDefault()
        router.navigate(hit.id, undefined, hit.vars)
    }

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        // Measure the outer box, whose width doesn't depend on the cards, and
        // only react to real changes — otherwise switching between the mobile
        // and desktop layouts can resize the box and loop forever (flicker).
        let raf = 0
        const ro = new ResizeObserver(([e]) => {
            const w = Math.round(e.contentRect.width)
            if (w < 50) return
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => setW((prev) => (Math.abs(prev - w) > 1 ? w : prev)))
        })
        ro.observe(el)
        return () => {
            ro.disconnect()
            cancelAnimationFrame(raf)
        }
    }, [])

    const shown = useMemo(
        () => projects.map((p, i) => ({ ...p, i })).filter((p) => filter === "All" || (p.category || "").includes(filter)),
        [projects, filter]
    )
    const mobile = W < mobileBreakpoint
    const n = shown.length
    const cw = Math.min(cardWidth, W * 0.32)
    // leave room for the hovered card's neighbours to slide apart, so the
    // first and last cards never get pushed out of the frame
    const room = Math.min(260, cw * 0.8)
    const step = n > 1 ? Math.max(0, Math.min((W - cw - room) / (n - 1), cw * 0.8)) : 0
    const offset = (W - (cw + step * (n - 1))) / 2
    // the raised card: whatever is hovered, otherwise the featured one
    const rest = filter === "All" ? shown.findIndex((p) => p.i === featured) : -1
    const active = hot >= 0 ? hot : rest
    const spread = active >= 0 ? Math.min(cw + 18 - step, room) : 0
    const mid = (n - 1) / 2
    const xOf = (i: number, a: number) => offset + i * step + (a < 0 ? 0 : i > a ? spread / 2 : -spread / 2)

    const onMove = (e: React.PointerEvent) => {
        if (mobile || e.pointerType === "touch" || !n) return
        const r = wrapRef.current.getBoundingClientRect()
        const px = e.clientX - r.left
        // hit-test against where the cards are heading, not where they are
        // mid-animation, and keep the raised card until the pointer clearly
        // leaves it — this is what stops it skipping past the next card
        if (active >= 0) {
            const ax = xOf(active, active)
            if (px >= ax - 6 && px <= ax + cw + 6) {
                if (hot !== active) setHot(active)
                return
            }
        }
        let pick = 0
        for (let i = 0; i < n; i++) if (px >= xOf(i, active)) pick = i
        setHot(pick)
    }

    // one sideways swipe = one card, however much momentum the trackpad adds
    const live = useRef({ active, n })
    live.current = { active, n }
    useEffect(() => {
        const el = wrapRef.current
        if (!el || mobile) return
        let acc = 0, locked = false, quiet = 0
        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
            e.preventDefault()
            clearTimeout(quiet)
            quiet = window.setTimeout(() => ((locked = false), (acc = 0)), 180)
            if (locked) return
            acc += e.deltaX
            if (Math.abs(acc) < 30) return
            const { active: a, n: count } = live.current
            setHot(Math.max(0, Math.min(count - 1, (a < 0 ? 0 : a) + (acc > 0 ? 1 : -1))))
            locked = true
        }
        el.addEventListener("wheel", onWheel, { passive: false })
        return () => {
            el.removeEventListener("wheel", onWheel)
            clearTimeout(quiet)
        }
    }, [mobile])

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
        e.preventDefault()
        const next = Math.max(0, Math.min(n - 1, (active < 0 ? 0 : active) + (e.key === "ArrowRight" ? 1 : -1)))
        setHot(next)
        cardRefs.current[next]?.focus()
    }

    return (
        <div ref={rootRef} style={{ width: "100%", height: "100%", minWidth: 0, display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif" }}>
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
                onKeyDown={onKey}
                style={
                    mobile
                        ? { display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", padding: "34px 0 20px", overscrollBehaviorX: "contain" }
                        : { position: "relative", flex: 1, minHeight: cardHeight + 100, overflowX: "clip" }
                }
            >
                {shown.map((p, i) => {
                    const isHot = i === active
                    const x = xOf(i, active)
                    const y = isHot ? -38 : Math.pow(i - mid, 2) * 1.4
                    const rot = isHot ? 0 : (i - mid) * 1.4
                    return (
                        <a
                            key={p.title + p.i}
                            ref={(el) => (cardRefs.current[i] = el)}
                            href={p.link}
                            onClick={(e) => go(e, p.link)}
                            onFocus={() => setHot(i)}
                            style={{
                                ...(mobile
                                    ? { position: "relative", flex: "0 0 78%", scrollSnapAlign: "center", scrollSnapStop: "always" }
                                    : {
                                          position: "absolute",
                                          left: 0,
                                          top: 60,
                                          width: cw,
                                          zIndex: isHot ? n + 1 : i + 1,
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

const GH = "https://y65zhu.github.io/portfolio/"
const yt = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
const P = (title, tab, kick, category, slug, coverUrl = "") => ({ title, tab, kick, category, link: `/work/${slug}`, coverUrl })

ProjectDeck.defaultProps = {
    featured: 5,
    cardWidth: 320,
    cardHeight: 440,
    mobileBreakpoint: 760,
    showFilters: true,
    filters: ["Brand", "Product", "Story", "Code"],
    projects: [
        P("Excel Gum", "Rebrand", "Made for Gen Z.", "Brand", "excel-gum", `${GH}excel-gum.jpg`),
        P("WaterlooWorks", "UX redesign", "A fairer job posting flow.", "Product", "waterlooworks", `${GH}waterlooworks.jpg`),
        P("TryOn Buddy", "AI fashion app", "See it on you before you buy it.", "Product", "tryon-buddy"),
        P("CAN Talk", "App design", "Canadian English, for newcomers.", "Product", "can-talk", `${GH}cantalk-story-1.jpg`),
        P("Biblely", "Bilingual app", "Read it, then actually understand it.", "Product", "biblely", `${GH}biblely.jpg`),
        P("DoFocus", "iOS app", "A focus timer with a buddy.", "Product Brand", "dofocus", `${GH}dofocus-home.jpg`),
        P("AI Certificate", "Print · 2025", "An eight-page brochure for WatSPEED.", "Brand", "ai-certificate", `${GH}brochure-1.jpg`),
        P("Antiques in Time", "Documentary", "A watchmaker, and the stories in the watches.", "Story", "antiques-in-time", yt("KOckxR6iWkQ")),
        P("Jane, Night Shift", "Audio doc", "The person who cleans the building after everyone leaves.", "Story", "jane-night-shift"),
        P("Before I Forget", "Narrative game", "A game whose interface forgets with you.", "Code Story", "before-i-forget", `${GH}before-i-forget.jpg`),
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
    featured: { type: ControlType.Number, title: "Raised at rest", min: -1, max: 30, step: 1, displayStepper: true, description: "Position in the list, counting from 0 (5 = DoFocus). -1 for none." },
    cardWidth: { type: ControlType.Number, min: 200, max: 480 },
    cardHeight: { type: ControlType.Number, min: 280, max: 640 },
    mobileBreakpoint: { type: ControlType.Number, title: "Mobile below", min: 320, max: 1200 },
    showFilters: { type: ControlType.Boolean, title: "Filters" },
    filters: { type: ControlType.Array, control: { type: ControlType.String }, hidden: (p) => !p.showFilters },
})
