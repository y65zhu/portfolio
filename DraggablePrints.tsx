import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * Photos as perforated postage-stamp prints scattered on a table.
 * Drag them around; click one to see it large. Landscape photos get a
 * landscape print, portrait photos a portrait one. Below the mobile
 * breakpoint they settle into a simple two-column grid.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function DraggablePrints(props) {
    const { prints, landscapeWidth, portraitWidth, mobileBreakpoint, stampColor } = props
    const wrapRef = useRef<HTMLDivElement>(null)
    const [W, setW] = useState(1200)
    const [ratio, setRatio] = useState<Record<number, number>>({})
    const [pos, setPos] = useState<Record<number, { x: number; y: number }>>({})
    const [z, setZ] = useState<Record<number, number>>({})
    const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null)
    const top = useRef(10)
    const drag = useRef<any>(null)

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
        ro.observe(el)
        const esc = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null)
        addEventListener("keydown", esc)
        return () => {
            ro.disconnect()
            removeEventListener("keydown", esc)
        }
    }, [])

    const mobile = W < mobileBreakpoint
    const perf = 7
    const mask = `linear-gradient(#000 0 0) content-box, radial-gradient(circle ${perf}px, #0000 96%, #000) ${-perf}px ${-perf}px / ${perf * 2.4}px ${perf * 2.4}px round`

    const down = (i: number) => (e: React.PointerEvent<HTMLElement>) => {
        if (mobile) return
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
        if (!d || !d.moved) setZoom({ src: prints[i].image?.src, alt: prints[i].image?.alt || "" })
    }

    return (
        <div
            ref={wrapRef}
            onPointerMove={move}
            style={
                mobile
                    ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, width: "100%" }
                    : { position: "relative", width: "100%", height: "100%" }
            }
        >
            {prints.map((p, i) => {
                if (!p.image?.src) return null
                const land = (ratio[i] || 0.75) > 1
                const dragging = drag.current?.i === i && drag.current.moved
                return (
                    <figure
                        key={i}
                        onPointerDown={down(i)}
                        onPointerUp={mobile ? () => setZoom({ src: p.image.src, alt: p.image.alt || "" }) : up(i)}
                        style={{
                            margin: 0,
                            padding: 12,
                            background: stampColor,
                            WebkitMask: mask,
                            mask,
                            filter: `drop-shadow(0 ${dragging ? 26 : 10}px ${dragging ? 30 : 14}px rgba(35,31,28,${dragging ? 0.3 : 0.18}))`,
                            cursor: mobile ? "zoom-in" : dragging ? "grabbing" : "grab",
                            userSelect: "none",
                            touchAction: mobile ? "auto" : "none",
                            transition: dragging ? "none" : "filter .2s, scale .25s",
                            scale: dragging ? "1.06" : "1",
                            ...(mobile
                                ? { gridColumn: land ? "span 2" : "auto" }
                                : {
                                      position: "absolute",
                                      left: pos[i] ? pos[i].x : `${p.x}%`,
                                      top: pos[i] ? pos[i].y : `${p.y}%`,
                                      width: `${land ? landscapeWidth : portraitWidth}%`,
                                      rotate: `${p.rotate}deg`,
                                      zIndex: z[i] || 1,
                                  }),
                        }}
                    >
                        <img
                            src={p.image.src}
                            alt={p.image.alt || ""}
                            draggable={false}
                            onLoad={(e) => {
                                const im = e.currentTarget
                                setRatio((s) => ({ ...s, [i]: im.naturalWidth / im.naturalHeight }))
                            }}
                            style={{ width: "100%", display: "block", pointerEvents: "none" }}
                        />
                        <figcaption
                            style={{
                                position: "absolute", right: 22, bottom: 18, color: "#ffb35c",
                                font: '500 12px "IBM Plex Mono", monospace', textShadow: "0 0 6px rgba(255,140,40,.7)",
                            }}
                        >
                            {p.caption || `CCD · No.${String(i + 1).padStart(2, "0")}`}
                        </figcaption>
                    </figure>
                )
            })}
            {zoom && (
                <div
                    onClick={() => setZoom(null)}
                    style={{
                        position: "fixed", inset: 0, zIndex: 9999, background: "rgba(20,16,12,.88)",
                        display: "grid", placeItems: "center", padding: "5vh 5vw", cursor: "zoom-out",
                    }}
                >
                    <img src={zoom.src} alt={zoom.alt} style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 3, boxShadow: "0 30px 80px rgba(0,0,0,.5)" }} />
                </div>
            )}
        </div>
    )
}

const spot = (x, y, rotate) => ({ x, y, rotate, caption: "" })

DraggablePrints.defaultProps = {
    landscapeWidth: 30,
    portraitWidth: 19,
    mobileBreakpoint: 760,
    stampColor: "#fbf8f2",
    prints: [spot(2, 2, -5), spot(23, 5, 2), spot(56, 1, 6), spot(78, 12, -3), spot(4, 50, 3), spot(39, 44, -6), spot(64, 52, 4)],
}

addPropertyControls(DraggablePrints, {
    prints: {
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                image: { type: ControlType.ResponsiveImage },
                caption: { type: ControlType.String, placeholder: "CCD · No.01" },
                x: { type: ControlType.Number, title: "Left %", min: 0, max: 95 },
                y: { type: ControlType.Number, title: "Top %", min: 0, max: 95 },
                rotate: { type: ControlType.Number, min: -15, max: 15 },
            },
        },
    },
    landscapeWidth: { type: ControlType.Number, title: "Landscape %", min: 10, max: 60 },
    portraitWidth: { type: ControlType.Number, title: "Portrait %", min: 8, max: 50 },
    mobileBreakpoint: { type: ControlType.Number, title: "Mobile below", min: 320, max: 1200 },
    stampColor: { type: ControlType.Color, title: "Paper" },
})
