import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { useSiteFonts } from "./HomeHero.tsx"
import { INK, ZHU } from "./Assets.tsx"

/**
 * The top of the About page: a 3:4 photo that stays in view on the left
 * while the story scrolls on the right, ending in three numbers that count
 * up. Wrap words in **double stars** to bold them. Stacks on phones.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function AboutHero(props) {
    const { photo, photoUrl, photoCaption, eyebrow, heading, paragraphs, stats, mobileBreakpoint } = props
    const ref = useRef<HTMLDivElement>(null)
    const [W, setW] = useState(1200)
    const mobile = W < mobileBreakpoint
    useSiteFonts()

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

    const src = photo?.src || photoUrl
    return (
        <section
            ref={ref}
            style={{
                width: "100%", boxSizing: "border-box", maxWidth: 1440, margin: "0 auto", color: INK,
                padding: `${mobile ? 110 : 160}px ${mobile ? "20px" : "clamp(24px, 6vw, 90px)"} 40px`,
                display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(260px, .72fr) minmax(0, 1.28fr)",
                gap: mobile ? 36 : "clamp(36px, 6vw, 100px)", alignItems: "start",
            }}
        >
            <figure style={{ margin: 0, position: mobile ? "relative" : "sticky", top: 110, maxWidth: mobile ? 420 : "none" }}>
                <div style={{ aspectRatio: "3 / 4", overflow: "hidden", borderRadius: 4, background: "#e6dccb" }}>
                    {src && <img src={src} alt={photo?.alt || "Annora with her camera"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                </div>
                <figcaption style={{ marginTop: 14, font: "300 15px/1.5 Inter, sans-serif", color: "#5a524a" }}>{photoCaption}</figcaption>
            </figure>
            <div>
                <p style={{ margin: "0 0 18px", font: '500 13px "IBM Plex Mono", monospace', letterSpacing: ".12em", textTransform: "uppercase", color: "#8f857a" }}>{eyebrow}</p>
                <h1 style={{ margin: "0 0 36px", font: `400 ${mobile ? "52px" : "clamp(60px, 7vw, 104px)"}/.96 Fraunces, serif`, letterSpacing: "-.028em" }}>{heading}</h1>
                {paragraphs.map((p, i) => (
                    <p key={i} style={{ margin: "0 0 1.1em", maxWidth: "38em", font: `400 ${mobile ? 19 : 22}px/1.55 Fraunces, serif`, color: i === 0 ? INK : "#5a524a" }}>
                        {p.split("**").map((part, k) => (k % 2 ? <strong key={k} style={{ fontWeight: 500, color: INK }}>{part}</strong> : part))}
                    </p>
                ))}
                <div
                    style={{
                        display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, minmax(0, 1fr))", marginTop: 44,
                        borderTop: "1px solid #d3c8b6", borderBottom: "1px solid #d3c8b6",
                    }}
                >
                    {stats.map((s, i) => (
                        <div key={i} style={{ padding: "26px 22px 24px", borderLeft: !mobile && i ? "1px solid #d3c8b6" : 0, borderTop: mobile && i ? "1px solid #d3c8b6" : 0 }}>
                            <Count to={s.value} suffix={s.suffix} />
                            <span style={{ display: "block", marginTop: 8, font: "300 15px/1.45 Inter, sans-serif", color: "#5a524a" }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function Count({ to, suffix }) {
    const [n, setN] = useState(to)
    const ref = useRef<HTMLSpanElement>(null)
    useEffect(() => {
        const el = ref.current
        if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return
        setN(0)
        let raf = 0
        const io = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return
            io.disconnect()
            const t0 = performance.now()
            const step = (t) => {
                const p = Math.min(1, (t - t0) / 1400)
                setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
                if (p < 1) raf = requestAnimationFrame(step)
            }
            raf = requestAnimationFrame(step)
        }, { threshold: 0.6 })
        io.observe(el)
        return () => {
            io.disconnect()
            cancelAnimationFrame(raf)
        }
    }, [to])
    return (
        <span ref={ref} style={{ display: "block", font: "400 56px/1 Fraunces, serif", letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums" }}>
            {n}
            <span style={{ color: ZHU }}>{suffix}</span>
        </span>
    )
}

AboutHero.defaultProps = {
    photoUrl: "https://y65zhu.github.io/portfolio/me-crop.jpg",
    photoCaption: "Usually on the other side of the lens.",
    eyebrow: "About",
    heading: "Hi, I'm Annora.",
    paragraphs: [
        "I'm a marketing and product-minded designer studying Global Business & Digital Arts at the University of Waterloo. I make the things that help people and products find each other — campaigns, brands, apps, and the occasional website (this one included).",
        "My training started early. I grew up in my family's restaurant in Beijing, lived in boarding schools, and moved to Canada on my own for high school. Since then I've spent almost every free hour working — **a restaurant, a dessert shop, a nail salon, a beauty clinic, an arcade, an e-commerce platform, an education company and a property management office.** I've done the marketing, the design, the code, the selling and the team support.",
        "All of it taught me one thing: people rarely say what they actually need. Sometimes they're shy; sometimes they don't know yet. Talk with them honestly and it surfaces. And treat the ones who can't buy today just as well — they come back.",
        "Friends call me the most coachable person they know: tell me how to do it better and I'll act on it the same day. I'm looking for a **marketing or product internship** where listening and moving fast both count.",
    ],
    stats: [
        { value: 8, suffix: "", label: "industries worked in" },
        { value: 5, suffix: "", label: "hats: marketing, design, code, sales, support" },
        { value: 30, suffix: "+", label: "leases signed a month at my current job" },
    ],
    mobileBreakpoint: 900,
}

addPropertyControls(AboutHero, {
    photo: { type: ControlType.ResponsiveImage, description: "Leave empty to use me-crop.jpg." },
    photoCaption: { type: ControlType.String, title: "Caption" },
    eyebrow: { type: ControlType.String },
    heading: { type: ControlType.String },
    paragraphs: { type: ControlType.Array, control: { type: ControlType.String, displayTextArea: true } },
    stats: {
        type: ControlType.Array,
        maxCount: 3,
        control: {
            type: ControlType.Object,
            controls: { value: { type: ControlType.Number, min: 0, max: 100000 }, suffix: { type: ControlType.String }, label: { type: ControlType.String } },
        },
    },
    mobileBreakpoint: { type: ControlType.Number, title: "Stack below", min: 320, max: 1400 },
})
