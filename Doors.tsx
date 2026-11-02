import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { INK, ZHU, PAPER } from "./Assets.tsx"
import { useNavigate, useSiteFonts } from "./HomeHero.tsx"

/**
 * "Look around": three doorway cards (Work / About / Lens) side by side at
 * 4:5, so the photos never stretch into full-width banners. One column on
 * phones.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Doors(props) {
    const { eyebrow, doors, mobileBreakpoint } = props
    const ref = useRef<HTMLDivElement>(null)
    const [W, setW] = useState(1200)
    const [hot, setHot] = useState(-1)
    const go = useNavigate()
    useSiteFonts()
    const mobile = W < mobileBreakpoint

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => {
            const w = Math.round(e.contentRect.width)
            if (w > 50) setW((p) => (Math.abs(p - w) > 1 ? w : p))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    return (
        <section ref={ref} style={{ width: "100%", boxSizing: "border-box", maxWidth: 1440, margin: "0 auto", padding: `0 ${mobile ? "20px" : "clamp(24px, 6vw, 90px)"}` }}>
            <p style={{ margin: "0 0 24px", font: '500 13px "IBM Plex Mono", monospace', letterSpacing: ".12em", textTransform: "uppercase", color: "#8f857a" }}>{eyebrow}</p>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: mobile ? 18 : "clamp(16px, 2vw, 28px)" }}>
                {doors.map((d, i) => {
                    const on = hot === i
                    const src = d.image?.src || d.imageUrl
                    return (
                        <a
                            key={i}
                            href={d.link}
                            onClick={(e) => go(e, d.link)}
                            onPointerEnter={() => setHot(i)}
                            onPointerLeave={() => setHot(-1)}
                            style={{
                                position: "relative", display: "block", aspectRatio: mobile ? "4 / 3" : "4 / 5", overflow: "hidden",
                                borderRadius: 4, background: "#e6dccb", color: PAPER, textDecoration: "none",
                            }}
                        >
                            {src && (
                                <img
                                    src={src}
                                    alt=""
                                    loading="lazy"
                                    style={{
                                        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                                        transform: on ? "scale(1.06)" : "scale(1)", transition: "transform 1s cubic-bezier(.2,.8,.2,1)",
                                    }}
                                />
                            )}
                            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,16,12,0) 45%, rgba(20,16,12,.72))" }} />
                            <span
                                aria-hidden
                                style={{
                                    position: "absolute", top: 18, right: 18, width: 44, height: 44, borderRadius: "50%",
                                    display: "grid", placeItems: "center", font: "400 18px Inter, sans-serif",
                                    background: on ? ZHU : "rgba(247,242,233,.92)", color: on ? PAPER : INK,
                                    transform: on ? "rotate(-45deg)" : "none", transition: "all .4s cubic-bezier(.2,.8,.2,1)",
                                }}
                            >
                                →
                            </span>
                            <span style={{ position: "absolute", left: 24, right: 24, bottom: 22 }}>
                                <span style={{ display: "block", font: '500 13px "IBM Plex Mono", monospace', color: "#f0d9c8" }}>{d.label}</span>
                                <span style={{ display: "block", marginTop: 6, font: `400 ${mobile ? 34 : 44}px/1 Fraunces, serif` }}>{d.title}</span>
                            </span>
                        </a>
                    )
                })}
            </div>
        </section>
    )
}

const D = (title, label, link, imageUrl) => ({ title, label, link, imageUrl })

Doors.defaultProps = {
    eyebrow: "Look around",
    mobileBreakpoint: 760,
    doors: [
        D("Work", "01 · 11 projects", "/work", "https://y65zhu.github.io/portfolio/excel-gum.jpg"),
        D("About", "02 · Beijing → Waterloo", "/about", "https://y65zhu.github.io/portfolio/beijing.jpg"),
        D("Lens", "03 · Portraits on a CCD", "/lens", "https://y65zhu.github.io/portfolio/lens-poker.jpg"),
    ],
}

addPropertyControls(Doors, {
    eyebrow: { type: ControlType.String },
    doors: {
        type: ControlType.Array,
        maxCount: 4,
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String },
                label: { type: ControlType.String },
                link: { type: ControlType.String },
                image: { type: ControlType.ResponsiveImage, description: "Leave empty to use the default photo." },
                imageUrl: { type: ControlType.String, title: "Image URL", hidden: () => true },
            },
        },
    },
    mobileBreakpoint: { type: ControlType.Number, title: "Mobile below", min: 320, max: 1200 },
})
