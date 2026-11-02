import { useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import { loadDanXing, PORTRAIT_MASK, INK, ZHU } from "./Assets.tsx"

/**
 * A portrait drawn in calligraphy characters. The cursor is a camera lens
 * that reveals the real photo and swirls the characters out of its way.
 * Give the frame a 3:4 aspect ratio.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function InkPortrait(props) {
    const { image, useMask, glyphs, ink, accent, lensSize, label } = props
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const cv = canvasRef.current
        if (!cv || !image?.src) return
        const ctx = cv.getContext("2d")
        const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
        const photo = new Image()
        photo.crossOrigin = "anonymous"
        photo.src = image.src
        const mask = new Image()
        mask.src = PORTRAIT_MASK

        let W = 0, H = 0, R = 0, raw = false, ready = false, visible = true, raf = 0
        let buckets: { size: number; pts: any[] }[] = []
        const lens = { x: 0, y: 0, tx: 0, ty: 0, active: false, last: 0 }

        const build = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            W = cv.clientWidth
            H = cv.clientHeight
            if (!W || !H) return
            cv.width = W * dpr
            cv.height = H * dpr
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            R = W * lensSize
            const cell = W < 380 ? 8 : 10
            const cols = Math.floor(W / cell), rows = Math.floor(H / cell)
            const sample = (src) => {
                const off = document.createElement("canvas")
                off.width = cols
                off.height = rows
                const o = off.getContext("2d", { willReadFrequently: true })
                o.drawImage(src, 0, 0, cols, rows)
                return o.getImageData(0, 0, cols, rows).data
            }
            let data, mdata
            try {
                data = sample(photo)
                mdata = useMask ? sample(mask) : null
            } catch {
                raw = true // the image host didn't allow pixel access; show the plain photo
                ready = true
                return
            }
            const onSubject = (q) => !mdata || mdata[q * 4] >= 90
            let lo = 255, hi = 0
            for (let q = 0; q < cols * rows; q++) {
                if (!onSubject(q)) continue
                const L = 0.299 * data[q * 4] + 0.587 * data[q * 4 + 1] + 0.114 * data[q * 4 + 2]
                lo = Math.min(lo, L)
                hi = Math.max(hi, L)
            }
            buckets = [cell * 0.85, cell * 1.1, cell * 1.35].map((s) => ({ size: s, pts: [] }))
            let k = 0
            for (let j = 0; j < rows; j++)
                for (let i = 0; i < cols; i++) {
                    const q = j * cols + i, p = q * 4
                    if (!onSubject(q)) continue
                    const r = data[p], g = data[p + 1], b = data[p + 2]
                    const L = (0.299 * r + 0.587 * g + 0.114 * b - lo) / Math.max(hi - lo, 1)
                    let d = 0.1 + 0.9 * Math.pow(clamp(1 - L, 0, 1), 1.3)
                    if (!mdata) {
                        // no matte: fade toward the edges so the subject stays readable
                        const ex = (i / cols - 0.5) / 0.5, ey = (j / rows - 0.55) / 0.6
                        d *= clamp(1.6 - (ex * ex + ey * ey), 0, 1)
                        if (d < 0.15) continue
                    }
                    const hx = i * cell + cell / 2 + (Math.random() - 0.5) * 2
                    const hy = j * cell + cell / 2 + (Math.random() - 0.5) * 2
                    buckets[d > 0.66 ? 2 : d > 0.33 ? 1 : 0].pts.push({
                        hx, hy, x: hx, y: hy,
                        a: 0.25 + d * 0.75,
                        red: r > 120 && r > g * 1.35 && r > b * 1.35,
                        ch: glyphs[(k++ * 7 + j * 3) % glyphs.length],
                    })
                }
            lens.x = lens.tx = W * 0.55
            lens.y = lens.ty = H * 0.42
            ready = true
        }

        const draw = (t) => {
            raf = requestAnimationFrame(draw)
            if (!ready || !visible) return
            if (raw) {
                ctx.drawImage(photo, 0, 0, W, H)
                return
            }
            if (!lens.active || t - lens.last > 2500) {
                lens.tx = W * (0.5 + 0.26 * Math.sin(t / 2100))
                lens.ty = H * (0.45 + 0.2 * Math.sin(t / 1500 + 1))
            }
            lens.x += (lens.tx - lens.x) * 0.12
            lens.y += (lens.ty - lens.y) * 0.12
            ctx.clearRect(0, 0, W, H)
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            const reach = R * 2.3
            for (const b of buckets) {
                ctx.font = `${b.size}px DanXing`
                for (const p of b.pts) {
                    const dx = p.hx - lens.x, dy = p.hy - lens.y
                    const dist = Math.hypot(dx, dy) || 1
                    let tx = p.hx, ty = p.hy
                    if (dist < reach) {
                        const f = 1 - dist / reach, push = f * f * R * 1.05
                        tx += (dx / dist) * push - (dy / dist) * push * 0.7
                        ty += (dy / dist) * push + (dx / dist) * push * 0.7
                    }
                    p.x += (tx - p.x) * 0.16
                    p.y += (ty - p.y) * 0.16
                    if (Math.hypot(p.x - lens.x, p.y - lens.y) < R * 0.98) continue
                    ctx.globalAlpha = p.a
                    ctx.fillStyle = p.red ? accent : ink
                    ctx.fillText(p.ch, p.x, p.y)
                }
            }
            ctx.globalAlpha = 1
            ctx.save()
            ctx.beginPath()
            ctx.arc(lens.x, lens.y, R, 0, Math.PI * 2)
            ctx.clip()
            ctx.translate(lens.x, lens.y)
            ctx.scale(1.12, 1.12)
            ctx.translate(-lens.x, -lens.y)
            ctx.drawImage(photo, 0, 0, W, H)
            ctx.restore()
            ctx.strokeStyle = ink
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(lens.x, lens.y, R, 0, Math.PI * 2)
            ctx.stroke()
            const s = R + 10, l = 12
            ctx.strokeStyle = accent
            ctx.lineWidth = 1.5
            for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
                const cx = lens.x + sx * s, cy = lens.y + sy * s
                ctx.beginPath()
                ctx.moveTo(cx, cy - sy * l)
                ctx.lineTo(cx, cy)
                ctx.lineTo(cx - sx * l, cy)
                ctx.stroke()
            }
            ctx.fillStyle = accent
            ctx.beginPath()
            ctx.arc(lens.x - s + 4, lens.y - s - 10, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.font = '500 10px "IBM Plex Mono", monospace'
            ctx.textAlign = "left"
            ctx.fillText(label, lens.x - s + 12, lens.y - s - 10)
        }

        const onMove = (e: PointerEvent) => {
            const r = cv.getBoundingClientRect()
            lens.tx = e.clientX - r.left
            lens.ty = e.clientY - r.top
            lens.active = true
            lens.last = performance.now()
        }
        const onLeave = () => (lens.active = false)
        cv.addEventListener("pointermove", onMove)
        cv.addEventListener("pointerleave", onLeave)
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
        io.observe(cv)
        const ro = new ResizeObserver(() => ready && build())
        ro.observe(cv)

        Promise.all([photo.decode(), mask.decode(), loadDanXing()]).then(() => {
            build()
            raf = requestAnimationFrame(draw)
        })

        return () => {
            cancelAnimationFrame(raf)
            io.disconnect()
            ro.disconnect()
            cv.removeEventListener("pointermove", onMove)
            cv.removeEventListener("pointerleave", onLeave)
        }
    }, [image?.src, useMask, glyphs, ink, accent, lensSize, label])

    return (
        <canvas
            ref={canvasRef}
            role="img"
            aria-label={image?.alt || "Portrait drawn in calligraphy characters"}
            style={{ width: "100%", height: "100%", display: "block", cursor: "none", touchAction: "pan-y" }}
        />
    )
}

InkPortrait.defaultProps = {
    useMask: true,
    glyphs: "听心光人影墨留白山水真美食舞星画看愛夢静月花雨雲誠朱硯潤",
    ink: INK,
    accent: ZHU,
    lensSize: 0.17,
    label: "CCD · f/2.8",
}

addPropertyControls(InkPortrait, {
    image: { type: ControlType.ResponsiveImage, title: "Photo" },
    useMask: {
        type: ControlType.Boolean,
        title: "Built-in matte",
        description: "Only matches the original hero photo (me-crop.jpg). Turn off for other photos.",
    },
    glyphs: {
        type: ControlType.String,
        title: "Glyphs",
        description: "Only characters in the DanXing subset render in the brush font.",
    },
    ink: { type: ControlType.Color, title: "Ink" },
    accent: { type: ControlType.Color, title: "Accent" },
    lensSize: { type: ControlType.Number, title: "Lens", min: 0.08, max: 0.3, step: 0.01 },
    label: { type: ControlType.String, title: "Lens label" },
})
