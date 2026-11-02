import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { useSiteFonts } from "./HomeHero.tsx"
import { INK, ZHU, PAPER } from "./Assets.tsx"
import InkScape from "./InkScape.tsx"

/**
 * A sheet of paper covering whatever you connect to "Underneath". The sheet
 * carries the site's ink painting — the name 朱硯潤 as a landscape.
 * Grab the bottom-right corner and peel it back; release past halfway and
 * it peels off. The fold line is the perpendicular bisector between the
 * corner and the pointer; whatever's past it is reflected into the flap.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function PeelReveal(props) {
    const { underneath, title, caption, hint, resetLabel, paper, seed } = props
    const stageRef = useRef<HTMLDivElement>(null)
    const coverRef = useRef<HTMLDivElement>(null)
    const flapRef = useRef<HTMLDivElement>(null)
    const [peeled, setPeeled] = useState(false)
    const api = useRef<{ putBack?: () => void }>({})
    useSiteFonts()

    useEffect(() => {
        const stage = stageRef.current, cover = coverRef.current, flap = flapRef.current
        if (!stage) return
        const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
        let peel = { x: 0, y: 0 }, anim = 0, peeling = false, moved = false, done = false

        const clipHalf = (poly, M, n, sign) => {
            const out = [], side = (p) => sign * ((p.x - M.x) * n.x + (p.y - M.y) * n.y)
            for (let i = 0; i < poly.length; i++) {
                const a = poly[i], b = poly[(i + 1) % poly.length], sa = side(a), sb = side(b)
                if (sa >= 0) out.push(a)
                if (sa * sb < 0) {
                    const t = sa / (sa - sb)
                    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
                }
            }
            return out
        }
        const poly = (pts, ox = 0, oy = 0) =>
            pts.length ? `polygon(${pts.map((p) => `${(p.x + ox).toFixed(1)}px ${(p.y + oy).toFixed(1)}px`).join(",")})` : "polygon(0 0, 0 0, 0 0)"

        const render = (px, py) => {
            const w = stage.clientWidth, h = stage.clientHeight
            peel = { x: px, y: py }
            const dx = w - px, dy = h - py, len = Math.hypot(dx, dy)
            if (len < 1) {
                cover.style.clipPath = ""
                flap.style.clipPath = poly([])
                return
            }
            const n = { x: dx / len, y: dy / len }, M = { x: (w + px) / 2, y: (h + py) / 2 }
            const rect = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }]
            const gone = clipHalf(rect, M, n, 1)
            cover.style.clipPath = poly(clipHalf(rect, M, n, -1))
            const refl = gone.map((p) => {
                const s = (p.x - M.x) * n.x + (p.y - M.y) * n.y
                return { x: p.x - 2 * s * n.x, y: p.y - 2 * s * n.y }
            })
            flap.style.clipPath = poly(refl, w, h)
            const v = { x: -n.x, y: -n.y }, ang = Math.atan2(v.x, -v.y)
            const L = Math.abs(3 * w * Math.sin(ang)) + Math.abs(3 * h * Math.cos(ang))
            const t0 = ((M.x - 0.5 * w) * v.x + (M.y - 0.5 * h) * v.y) / L + 0.5
            const span = Math.max(...gone.map((p) => (p.x - M.x) * n.x + (p.y - M.y) * n.y), 1) / L
            flap.style.background = `linear-gradient(${ang}rad, #c9bda8 ${t0 * 100}%, #f4eee3 ${(t0 + span * 0.4) * 100}%, #fffdf8 ${(t0 + span) * 100}%)`
        }
        const rest = () => ({ x: stage.clientWidth - 46, y: stage.clientHeight - 46 })
        const animate = (to, ms, cb?) => {
            cancelAnimationFrame(anim)
            const from = { ...peel }, t0 = performance.now()
            const step = (t) => {
                const p = clamp((t - t0) / ms, 0, 1), e = 1 - Math.pow(1 - p, 3)
                render(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e)
                if (p < 1) anim = requestAnimationFrame(step)
                else cb && cb()
            }
            anim = requestAnimationFrame(step)
        }
        const peelAway = () => {
            done = true
            animate({ x: -stage.clientWidth * 1.3, y: -stage.clientHeight * 1.3 }, 900, () => setPeeled(true))
        }
        api.current.putBack = () => {
            done = false
            setPeeled(false)
            requestAnimationFrame(() => animate(rest(), 800))
        }

        const corner = stage.querySelector("[data-corner]") as HTMLElement
        const enter = () => !peeling && !done && animate({ x: stage.clientWidth - 110, y: stage.clientHeight - 90 }, 400)
        const leave = () => !peeling && !done && animate(rest(), 400)
        const down = (e: PointerEvent) => {
            peeling = true
            moved = false
            cancelAnimationFrame(anim)
            corner.setPointerCapture(e.pointerId)
        }
        const move = (e: PointerEvent) => {
            if (!peeling) return
            moved = true
            const r = stage.getBoundingClientRect()
            render(clamp(e.clientX - r.left, -r.width, r.width), clamp(e.clientY - r.top, -r.height, r.height))
        }
        const up = () => {
            if (!peeling) return
            peeling = false
            if (!moved) return peelAway() // a plain click or keyboard press peels it all
            const w = stage.clientWidth, h = stage.clientHeight
            if (Math.hypot(w - peel.x, h - peel.y) > Math.min(w, h) * 0.55) peelAway()
            else animate(rest(), 500)
        }
        const key = (e: KeyboardEvent) => (e.key === "Enter" || e.key === " ") && peelAway()
        corner.addEventListener("pointerenter", enter)
        corner.addEventListener("pointerleave", leave)
        corner.addEventListener("pointerdown", down)
        corner.addEventListener("pointermove", move)
        corner.addEventListener("pointerup", up)
        corner.addEventListener("keydown", key)
        const ro = new ResizeObserver(() => !done && render(rest().x, rest().y))
        ro.observe(stage)
        render(rest().x, rest().y)
        return () => {
            cancelAnimationFrame(anim)
            ro.disconnect()
            corner.removeEventListener("pointerenter", enter)
            corner.removeEventListener("pointerleave", leave)
            corner.removeEventListener("pointerdown", down)
            corner.removeEventListener("pointermove", move)
            corner.removeEventListener("pointerup", up)
            corner.removeEventListener("keydown", key)
        }
    }, [])

    return (
        <div ref={stageRef} style={{ position: "relative", width: "100%", height: "100%" }}>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 4 }}>{underneath}</div>
            <div
                ref={coverRef}
                style={{
                    position: "absolute", inset: 0, zIndex: 5, display: peeled ? "none" : "grid", placeItems: "center",
                    background: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.5), transparent 60%), ${paper}`,
                    border: "1px solid #d3c8b6", borderRadius: 4, userSelect: "none",
                }}
            >
                <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 4 }}>
                    <InkScape {...(InkScape as any).defaultProps} seed={seed} />
                </div>
                <div style={{ position: "absolute", left: 32, top: 30, maxWidth: 380 }}>
                    <span style={{ display: "block", font: "400 28px/1.1 Fraunces, serif", color: INK }}>{title}</span>
                    <span style={{ display: "block", marginTop: 10, font: "300 15px/1.55 Inter, sans-serif", color: "#5a524a" }}>{caption}</span>
                </div>
                <span style={{ position: "absolute", right: 30, bottom: 26, font: '500 13px "IBM Plex Mono", monospace', color: ZHU }}>{hint}</span>
            </div>
            <div style={{ position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none", display: peeled ? "none" : "block", filter: "drop-shadow(-6px -6px 10px rgba(35,31,28,.28))" }}>
                <div ref={flapRef} style={{ position: "absolute", left: "-100%", top: "-100%", width: "300%", height: "300%" }} />
            </div>
            <button
                data-corner
                aria-label="Peel back the cover to see what's underneath"
                style={{
                    position: "absolute", right: 0, bottom: 0, width: 120, height: 120, zIndex: 7,
                    display: peeled ? "none" : "block", background: "none", border: 0, cursor: "grab", touchAction: "none",
                }}
            />
            {peeled && (
                <button
                    onClick={() => api.current.putBack?.()}
                    style={{
                        position: "absolute", left: "50%", bottom: -40, transform: "translateX(-50%)",
                        background: "none", border: 0, borderBottom: "1px solid #d3c8b6", color: "#8f857a",
                        font: '13px "IBM Plex Mono", monospace', cursor: "pointer",
                    }}
                >
                    {resetLabel}
                </button>
            )}
        </div>
    )
}

PeelReveal.defaultProps = {
    title: "My name, painted.",
    caption: "Stone for Yàn (an inkstone), water for Rùn (to nourish), and a vermilion sun for Zhū. Nothing else to see here… probably.",
    seed: 7,
    hint: "Grab the corner & peel ↘",
    resetLabel: "Sweep it back under the rug ↺",
    paper: PAPER,
}

addPropertyControls(PeelReveal, {
    underneath: { type: ControlType.ComponentInstance, title: "Underneath" },
    title: { type: ControlType.String },
    caption: { type: ControlType.String, displayTextArea: true },
    seed: { type: ControlType.Number, title: "Painting seed", min: 1, max: 999, step: 1, displayStepper: true },
    hint: { type: ControlType.String },
    resetLabel: { type: ControlType.String, title: "Reset label" },
    paper: { type: ControlType.Color },
})
