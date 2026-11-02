import { useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import { INK, ZHU } from "./Assets.tsx"

/**
 * The site's recurring illustration: an abstract ink-wash painting of the
 * name 朱硯潤 — stone for 硯 (inkstone), water for 潤 (to nourish), and a
 * vermilion sun for 朱. Painted live from a seed, so every instance can be
 * a different view of the same landscape.
 *
 * Scenes:
 *  - Landscape: three ridges fading into mist, a sun, dry-brush water
 *  - Ridge: one low ridge — use it as a section divider or footer band
 *  - Stone: an ink pool seen from above — small vignettes and cards
 *
 * Layers rise in when scrolled into view and drift apart while you scroll.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function InkScape(props) {
    const { scene, seed, ink, sun, sunColor, sunX, sunY, water, parallax, reveal } = props
    const rootRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const root = rootRef.current
        if (!root) return
        let layers: { el: HTMLCanvasElement; depth: number }[] = []
        let raf = 0, W = 0, H = 0, shown = !reveal, near = false, dirty = true
        const pad = parallax ? 40 : 0

        const paint = () => {
            W = Math.round(root.clientWidth)
            H = Math.round(root.clientHeight)
            if (W < 10 || H < 10) return
            root.querySelectorAll("canvas").forEach((c) => c.remove())
            layers = []
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
            const rand = mulberry32(seed * 9973 + 17)
            const layer = (depth: number, draw: (c: CanvasRenderingContext2D) => void) => {
                const el = document.createElement("canvas")
                el.width = W * dpr
                el.height = (H + pad * 2) * dpr
                Object.assign(el.style, {
                    position: "absolute", left: "0", top: `${-pad}px`, width: `${W}px`, height: `${H + pad * 2}px`,
                    pointerEvents: "none", willChange: "transform",
                    opacity: shown ? "1" : "0",
                    transition: `opacity 1.6s ease ${layers.length * 0.28}s, translate 1.8s cubic-bezier(.2,.8,.2,1) ${layers.length * 0.28}s`,
                    translate: shown ? "0 0" : "0 18px",
                })
                const c = el.getContext("2d")
                c.setTransform(dpr, 0, 0, dpr, 0, pad * dpr)
                draw(c)
                root.appendChild(el)
                layers.push({ el, depth })
            }

            if (scene === "stone") {
                const cx = W * 0.5, cy = H * 0.5, r = Math.min(W, H) * 0.34
                layer(0.2, (c) => offscreen(c, W, H, pad, (o) => {
                    wash(o, blob(cx, cy, r * 1.15, 18, rand), ink, 0.007, 44, rand, 0.12)
                    grain(o, W, H, rand, 0.5)
                }))
                layer(0.5, (c) => offscreen(c, W, H, pad, (o) => {
                    wash(o, blob(cx - r * 0.1, cy + r * 0.06, r * 0.66, 14, rand), ink, 0.011, 44, rand, 0.11)
                    grain(o, W, H, rand, 0.4)
                }))
                layer(0.8, (c) => offscreen(c, W, H, pad, (o) => {
                    const arc = Array.from({ length: 10 }, (_, j) => {
                        const a = Math.PI * (0.95 - j * 0.075)
                        return { x: cx + Math.cos(a) * r * 1.22, y: cy + Math.sin(a) * r * 1.0 }
                    })
                    brush(o, arc, Math.max(2, r * 0.07), ink, 0.75, rand, 0.6)
                    if (sun) wash(o, blob(cx + r * 0.62, cy - r * 0.55, r * 0.17, 12, rand), sunColor, 0.022, 50, rand, 0.09)
                }))
            } else {
                const ridges = scene === "ridge"
                    ? [{ base: 0.92, height: 0.62, alpha: 0.03, depth: 0.6, color: ink }]
                    : [
                          { base: 0.62, height: 0.34, alpha: 0.012, depth: 0.15, color: mix(ink, "#8c949c", 0.55) },
                          { base: 0.8, height: 0.36, alpha: 0.02, depth: 0.4, color: mix(ink, "#7a7f86", 0.3) },
                          { base: 1.0, height: 0.3, alpha: 0.034, depth: 0.75, color: ink },
                      ]
                if (sun) {
                    const r = Math.min(W, H) * (scene === "ridge" ? 0.16 : 0.075)
                    layer(0.05, (c) => offscreen(c, W, H, pad, (o) => {
                        wash(o, blob(W * sunX / 100, H * sunY / 100, r, 14, rand), sunColor, 0.02, 56, rand, 0.09)
                        grain(o, W, H, rand, 0.35)
                    }))
                }
                ridges.forEach((g, k) => {
                    layer(g.depth, (c) => {
                        const top = ridgeTop(W, H, g.base, g.height, rand, k)
                        // close the shape along a finely divided bottom edge — one long edge would get deformed wildly
                        const floor = Array.from({ length: 24 }, (_, j) => ({ x: 1.08 * W - (j / 23) * 1.16 * W, y: H * 1.3 }))
                        const body = [...top, ...floor]
                        offscreen(c, W, H, pad, (o) => {
                            wash(o, body, g.color, g.alpha, 44, rand, 0.05)
                            // wet-in-wet: ink pools darker under the crests, kept inside the ridge
                            o.save()
                            o.beginPath()
                            body.forEach((p, j) => (j ? o.lineTo(p.x, p.y) : o.moveTo(p.x, p.y)))
                            o.clip()
                            const crest = top.reduce((m, p) => (p.y < m.y ? p : m), top[0])
                            for (let q = 0; q < 2; q++) {
                                const at = q === 0 ? crest : top[Math.floor(rand() * top.length)]
                                const r = H * g.height * (0.3 + rand() * 0.2)
                                wash(o, blob(at.x, at.y + r * 0.6, r, 12, rand), g.color, g.alpha * 0.45, 24, rand, 0.1)
                            }
                            o.restore()
                            // mist: the ridge dissolves toward its foot
                            o.globalCompositeOperation = "destination-in"
                            const t = H * (g.base - g.height), foot = H * g.base
                            const grad = o.createLinearGradient(0, t, 0, foot + H * 0.04)
                            grad.addColorStop(0, "#000")
                            grad.addColorStop(0.5, "rgba(0,0,0,.6)")
                            grad.addColorStop(1, "rgba(0,0,0,0)")
                            o.fillStyle = grad
                            o.fillRect(-W, -H, W * 3, H * 3)
                            o.globalCompositeOperation = "source-over"
                            // a painter never outlines the whole ridge: a few broken strokes along it
                            const spans = 2 + Math.floor(rand() * 3)
                            for (let q = 0; q < spans; q++) {
                                const a = Math.floor(rand() * top.length * 0.8), len = Math.floor(top.length * (0.12 + rand() * 0.25))
                                brush(o, top.slice(a, a + len), Math.max(1.5, H * 0.011 * (0.5 + g.depth)), g.color, 0.2 + g.depth * 0.5, rand, 0.8)
                            }
                            grain(o, W, H, rand, 0.5)
                        })
                    })
                })
                if (water && scene === "landscape") {
                    layer(0.95, (c) => {
                        for (let i = 0; i < 3; i++) {
                            const y = H * (0.86 + i * 0.045)
                            const x = W * (0.08 + rand() * 0.45)
                            const len = W * (0.16 + rand() * 0.2)
                            const line = Array.from({ length: 8 }, (_, j) => ({ x: x + (j / 7) * len, y: y + Math.sin(j * 0.9 + i) * H * 0.004 }))
                            offscreen(c, W, H, pad, (o) => brush(o, line, Math.max(1.5, H * 0.006), ink, 0.55, rand, 0.75))
                        }
                    })
                }
            }
            dirty = false
            if (!shown) io.observe(root)
            update()
        }

        const update = () => {
            raf = 0
            if (!parallax || !layers.length) return
            const r = root.getBoundingClientRect()
            const vh = window.innerHeight
            const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)) // -1 … 1
            for (const l of layers) l.el.style.transform = `translate3d(0, ${(p * pad * l.depth).toFixed(1)}px, 0)`
        }
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update)
        }
        const io = new IntersectionObserver(
            ([e]) => {
                if (!e.isIntersecting) return
                io.disconnect()
                shown = true
                for (const l of layers) {
                    l.el.style.opacity = "1"
                    l.el.style.translate = "0 0"
                }
            },
            { threshold: 0.25 }
        )

        let lastW = 0, lastH = 0, t = 0
        const ro = new ResizeObserver(() => {
            const w = Math.round(root.clientWidth), h = Math.round(root.clientHeight)
            if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return
            lastW = w
            lastH = h
            dirty = true
            clearTimeout(t)
            if (near) t = window.setTimeout(paint, 60)
        })
        // painting takes a moment, so only paint once the picture is close to the screen
        const lazy = new IntersectionObserver(
            ([e]) => {
                near = e.isIntersecting
                if (near && dirty) paint()
            },
            { rootMargin: "400px 0px" }
        )
        ro.observe(root)
        lazy.observe(root)
        addEventListener("scroll", onScroll, { capture: true, passive: true })
        return () => {
            ro.disconnect()
            io.disconnect()
            lazy.disconnect()
            clearTimeout(t)
            cancelAnimationFrame(raf)
            removeEventListener("scroll", onScroll, { capture: true } as any)
        }
    }, [scene, seed, ink, sun, sunColor, sunX, sunY, water, parallax, reveal])

    return <div ref={rootRef} role="img" aria-label="Ink-wash landscape" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }} />
}

// ——— painting helpers ———

type Pt = { x: number; y: number }

function mulberry32(a: number) {
    return () => {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}
const gauss = (rand) => {
    let s = 0
    for (let i = 0; i < 4; i++) s += rand()
    return (s - 2) / 0.58
}

function mix(a: string, b: string, t: number) {
    const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
    const A = p(a.length === 7 ? a : "#231f1c"), B = p(b)
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")
}

/** Midpoint displacement: every pass splits each edge and nudges the new point. */
function deform(pts: Pt[], depth: number, v: number, rand, closed = true): Pt[] {
    let out = pts
    for (let d = 0; d < depth; d++) {
        const next: Pt[] = []
        const n = closed ? out.length : out.length - 1
        for (let i = 0; i < n; i++) {
            const a = out[i], b = out[(i + 1) % out.length]
            const len = Math.hypot(b.x - a.x, b.y - a.y)
            next.push(a, { x: (a.x + b.x) / 2 + gauss(rand) * v * len, y: (a.y + b.y) / 2 + gauss(rand) * v * len })
        }
        if (!closed) next.push(out[out.length - 1])
        out = next
        v *= 0.72
    }
    return out
}

function blob(cx: number, cy: number, r: number, n: number, rand): Pt[] {
    return Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2, rr = r * (0.85 + rand() * 0.3)
        return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr }
    })
}

function ridgeTop(W: number, H: number, base: number, height: number, rand, k: number): Pt[] {
    const n = 90
    const peaks = Array.from({ length: 2 + k }, () => ({ at: 0.1 + rand() * 0.8, h: 0.45 + rand() * 0.55, w: 0.05 + rand() * 0.12 }))
    const ph = [rand() * 9, rand() * 9, rand() * 9]
    const top: Pt[] = []
    for (let i = 0; i <= n; i++) {
        const u = i / n
        let h = 0.1 + 0.05 * Math.sin(u * 7 + ph[0])
        // sharpened bumps read as peaks rather than hills
        for (const p of peaks) h = Math.max(h, p.h * Math.pow(Math.exp(-Math.abs((u - p.at) / p.w)), 1.15))
        h += 0.025 * Math.sin(u * 41 + ph[1]) + 0.015 * Math.sin(u * 97 + ph[2])
        top.push({ x: -0.08 * W + u * 1.16 * W, y: H * (base - height * h) })
    }
    return top
}

/** Draw into a scratch canvas first, so erasing (grain, dry brush) can't eat the layers below. */
function offscreen(c: CanvasRenderingContext2D, W: number, H: number, pad: number, draw: (o: CanvasRenderingContext2D) => void) {
    const t = c.getTransform()
    const o = document.createElement("canvas")
    o.width = c.canvas.width
    o.height = c.canvas.height
    const x = o.getContext("2d")
    x.setTransform(t)
    draw(x)
    c.save()
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.drawImage(o, 0, 0)
    c.restore()
}

/** Xuan paper drinks the ink unevenly: knock tiny flecks out of what was painted. */
function grain(c: CanvasRenderingContext2D, W: number, H: number, rand, amount: number) {
    c.save()
    c.globalCompositeOperation = "destination-out"
    const n = Math.round((W * H) / 900 * amount)
    for (let i = 0; i < n; i++) {
        c.globalAlpha = 0.15 + rand() * 0.45
        const r = 0.4 + rand() * 1.6
        c.fillRect(rand() * W, rand() * H, r * (1 + rand() * 3), r)
    }
    c.restore()
}

/** A loaded brush along a path: swells, tapers, and breaks into dry streaks at the tail. */
function brush(c: CanvasRenderingContext2D, path: Pt[], width: number, color: string, alpha: number, rand, dry = 0.45) {
    // resample evenly
    const pts: Pt[] = []
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 3))
        for (let j = 0; j < n; j++) pts.push({ x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n })
    }
    pts.push(path[path.length - 1])
    const N = pts.length
    if (N < 3) return
    const phase = rand() * 10
    c.fillStyle = color
    for (let pass = 0; pass < 3; pass++) {
        c.globalAlpha = alpha * (pass ? 0.35 : 0.8)
        const L: Pt[] = [], R: Pt[] = []
        for (let i = 0; i < N; i++) {
            const u = i / (N - 1)
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)]
            const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
            const nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len
            const w = width * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05 + 0.02)), 0.5) * (0.7 + 0.45 * Math.sin(u * 11 + phase + pass)) * (pass ? 1.6 : 1)
            const j = (rand() - 0.5) * width * 0.25
            L.push({ x: pts[i].x + nx * (w / 2 + j), y: pts[i].y + ny * (w / 2 + j) })
            R.push({ x: pts[i].x - nx * (w / 2 - j), y: pts[i].y - ny * (w / 2 - j) })
        }
        c.beginPath()
        L.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)))
        for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i].x, R[i].y)
        c.closePath()
        c.fill()
    }
    // feibai: streaks of bare paper running along the stroke, more toward the tail
    c.save()
    c.globalCompositeOperation = "destination-out"
    c.lineCap = "round"
    const streaks = Math.round(10 * dry)
    for (let s = 0; s < streaks; s++) {
        const off = (rand() - 0.5) * width * 1.1
        const start = Math.floor(N * (0.3 + rand() * 0.5))
        c.globalAlpha = 0.5 + rand() * 0.5
        c.lineWidth = 0.5 + rand() * width * 0.12
        c.beginPath()
        for (let i = start; i < N; i++) {
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)]
            const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
            const x = pts[i].x - ((b.y - a.y) / len) * off, y = pts[i].y + ((b.x - a.x) / len) * off
            i === start ? c.moveTo(x, y) : c.lineTo(x, y)
        }
        c.stroke()
    }
    c.restore()
    c.globalAlpha = 1
}

/** Tyler Hobbs–style wash: many faint, differently deformed copies of one shape. */
function wash(c: CanvasRenderingContext2D, shape: Pt[], color: string, alpha: number, coats: number, rand, v: number) {
    const base = deform(shape, 2, v * 1.4, rand)
    c.fillStyle = color
    c.globalAlpha = alpha
    for (let i = 0; i < coats; i++) {
        const pts = deform(base, 4, v, rand)
        c.beginPath()
        pts.forEach((p, j) => (j ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)))
        c.closePath()
        c.fill()
    }
    c.globalAlpha = 1
}

InkScape.defaultProps = {
    scene: "landscape",
    seed: 7,
    ink: INK,
    sun: true,
    sunColor: ZHU,
    sunX: 74,
    sunY: 26,
    water: true,
    parallax: true,
    reveal: true,
}

addPropertyControls(InkScape, {
    scene: {
        type: ControlType.Enum,
        options: ["landscape", "ridge", "stone"],
        optionTitles: ["Landscape", "Ridge (divider)", "Stone (vignette)"],
    },
    seed: { type: ControlType.Number, min: 1, max: 999, step: 1, displayStepper: true, description: "Change for a different view of the same landscape." },
    ink: { type: ControlType.Color },
    sun: { type: ControlType.Boolean, title: "Vermilion sun" },
    sunColor: { type: ControlType.Color, title: "Sun", hidden: (p) => !p.sun },
    sunX: { type: ControlType.Number, title: "Sun X", min: 0, max: 100, unit: "%", hidden: (p) => !p.sun || p.scene === "stone" },
    sunY: { type: ControlType.Number, title: "Sun Y", min: 0, max: 100, unit: "%", hidden: (p) => !p.sun || p.scene === "stone" },
    water: { type: ControlType.Boolean, title: "Water lines", hidden: (p) => p.scene !== "landscape" },
    parallax: { type: ControlType.Boolean },
    reveal: { type: ControlType.Boolean, title: "Fade in on scroll" },
})
