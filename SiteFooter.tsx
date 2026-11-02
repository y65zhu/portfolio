import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { useSiteFonts } from "./HomeHero.tsx"
import { loadDanXing, INK, ZHU, PAPER } from "./Assets.tsx"
import InkScape from "./InkScape.tsx"

/**
 * The whole footer: contact links on the left, the signed-and-sealed name on
 * the right, an ink ridge along the bottom. Clicking anywhere that isn't a
 * link presses your own seal into the paper.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SiteFooter(props) {
    const { eyebrow, heading, email, links, name, romanized, note, hint, replies, copyright, credit, landscape, seed, mobileBreakpoint } = props
    const ref = useRef<HTMLDivElement>(null)
    const [W, setW] = useState(1200)
    const [seals, setSeals] = useState<{ x: number; y: number; r: number; id: number }[]>([])
    const count = useRef(0)
    const mobile = W < mobileBreakpoint
    useSiteFonts()

    useEffect(() => {
        loadDanXing()
        const el = ref.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => {
            const w = Math.round(e.contentRect.width)
            if (w > 50) setW((p) => (Math.abs(p - w) > 1 ? w : p))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const stamp = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest("a, button")) return
        const r = ref.current.getBoundingClientRect()
        count.current++
        setSeals((s) => [...s, { x: e.clientX - r.left, y: e.clientY - r.top, r: Math.random() * 14 - 7, id: count.current }].slice(-30))
    }
    const line = count.current ? replies[Math.min(count.current, replies.length) - 1] : hint
    const gutter = mobile ? 20 : "clamp(24px, 6vw, 90px)"
    const sigSize = mobile ? 64 : 92

    return (
        <footer ref={ref} onClick={stamp} style={{ position: "relative", width: "100%", cursor: "crosshair", color: INK, overflow: "hidden" }}>
            <style>{`@keyframes seal-thunk { from { scale: 1.8; opacity: 0 } }`}</style>
            <div
                style={{
                    display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0, 1.2fr) minmax(0, .8fr)",
                    gap: mobile ? 56 : "clamp(40px, 6vw, 96px)", alignItems: "end",
                    padding: `${mobile ? 96 : 140}px ${typeof gutter === "number" ? gutter + "px" : gutter} 0`,
                    maxWidth: 1440, margin: "0 auto", boxSizing: "border-box", position: "relative", zIndex: 1,
                }}
            >
                <div>
                    <p style={{ margin: "0 0 20px", font: '500 13px "IBM Plex Mono", monospace', letterSpacing: ".12em", textTransform: "uppercase", color: "#8f857a" }}>{eyebrow}</p>
                    <h2 style={{ margin: 0, font: `400 ${mobile ? "40px" : "clamp(44px, 5.2vw, 76px)"}/1.02 Fraunces, serif`, letterSpacing: "-.02em", maxWidth: "14ch" }}>{heading}</h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 28px", marginTop: 40, font: "400 18px/1.4 Inter, sans-serif" }}>
                        <a href={`mailto:${email}`} style={linkStyle}>{email}</a>
                        {links.map((l, i) => (
                            <a key={i} href={l.url} target="_blank" rel="noreferrer" style={linkStyle}>
                                {l.label} ↗
                            </a>
                        ))}
                    </div>
                </div>
                <figure style={{ margin: 0, justifySelf: mobile ? "start" : "end" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: sigSize * 0.22 }}>
                        <span style={{ font: `${sigSize}px/1 DanXing, serif`, color: INK, whiteSpace: "nowrap" }}>{name}</span>
                        <SealMark height={sigSize * 1.05} style={{ marginBottom: sigSize * 0.08, rotate: "-3deg" }} />
                    </div>
                    <figcaption style={{ marginTop: 18, maxWidth: 360 }}>
                        <span style={{ display: "block", font: '500 13px "IBM Plex Mono", monospace', letterSpacing: ".06em", color: ZHU }}>{romanized}</span>
                        <span style={{ display: "block", marginTop: 6, font: "300 15px/1.55 Inter, sans-serif", color: "#5a524a" }}>{note}</span>
                    </figcaption>
                </figure>
            </div>
            <p style={{ position: "relative", zIndex: 1, margin: 0, padding: `40px ${typeof gutter === "number" ? gutter + "px" : gutter} 0`, maxWidth: 1440, marginInline: "auto", boxSizing: "border-box", font: '13px "IBM Plex Mono", monospace', color: "#8f857a" }}>
                {line}
            </p>
            {landscape ? (
                <div style={{ height: mobile ? 110 : 170, marginTop: -10, pointerEvents: "none" }}>
                    <InkScape {...(InkScape as any).defaultProps} scene="ridge" seed={seed} sunX={86} sunY={34} />
                </div>
            ) : (
                <div style={{ height: 60 }} />
            )}
            <div
                style={{
                    display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", borderTop: "1px solid #d3c8b6",
                    padding: `18px ${typeof gutter === "number" ? gutter + "px" : gutter} 28px`, font: '13px "IBM Plex Mono", monospace', color: "#8f857a",
                }}
            >
                <span>{copyright}</span>
                <span>{credit}</span>
            </div>
            {seals.map((s) => (
                <SealMark
                    key={s.id}
                    height={64}
                    style={{
                        position: "absolute", left: s.x, top: s.y, translate: "-50% -50%", rotate: `${s.r}deg`, zIndex: 2,
                        pointerEvents: "none", animation: "seal-thunk .35s cubic-bezier(.2,.9,.3,1.4) both",
                    }}
                />
            ))}
        </footer>
    )
}

const linkStyle: React.CSSProperties = { color: INK, textDecoration: "none", borderBottom: "1px solid #d3c8b6", paddingBottom: 3 }

/**
 * 硯潤 as a carved white-text seal: square-cut, clerical-style strokes in the
 * manner of Han seal script, roughened like stone that has been inked a
 * hundred times. Drawn as paths, so no font is needed.
 */
export function SealMark({ height = 80, color = ZHU, style = {} as React.CSSProperties }) {
    const id = useRef("s" + Math.random().toString(36).slice(2, 8)).current
    // each character sits in a 50×50 cell; 硯 on top, 潤 below
    const yan = [
        "M3 6H20", "M12 6L4 17V47", "M10 23H20V44H10Z", // 石
        "M25 3H47V30H25Z", "M25 12H47", "M25 21H47", // 目
        "M31 30V39L24 47", "M40 30V45H49V39", // 儿
    ]
    const run = [
        "M2 7L8 12", "M1 21L8 26", "M2 47L9 34", // 氵
        "M14 3V48", "M14 3H27V18H14", "M14 10.5H27", // 門 left
        "M36 3H48V45L44 48", "M36 3V18H48", "M36 10.5H48", // 門 right
        "M21 25H42", "M22.5 35H40.5", "M19.5 45H43.5", "M31.5 25V45", // 王
    ]
    return (
        <svg viewBox="0 0 64 120" height={height} width={(height * 64) / 120} aria-hidden style={{ display: "block", flexShrink: 0, ...style }}>
            <defs>
                <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" result="d" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="3" seed="9" result="w" />
                    <feColorMatrix in="w" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -28 19" result="worn" />
                    <feComposite in="d" in2="worn" operator="in" />
                </filter>
                <mask id={id + "m"}>
                    <rect width="64" height="120" fill="#fff" />
                    <g fill="none" stroke="#000" strokeWidth="3.7" strokeLinecap="square" strokeLinejoin="miter">
                        <g transform="translate(7 6)">{yan.map((d, i) => <path key={i} d={d} />)}</g>
                        <g transform="translate(7 64)">{run.map((d, i) => <path key={i} d={d} />)}</g>
                    </g>
                </mask>
            </defs>
            <g filter={`url(#${id})`}>
                <path d="M2.5 1.8 L61.6 2.6 L62.2 117.6 L1.8 118.3 Z" fill={color} mask={`url(#${id}m)`} />
            </g>
        </svg>
    )
}

SiteFooter.defaultProps = {
    eyebrow: "Say hi",
    heading: "If you read this far, we'd probably get along.",
    email: "y65zhu@uwaterloo.ca",
    links: [
        { label: "LinkedIn", url: "https://www.linkedin.com/in/annora-zhu-1355352b9" },
        { label: "Instagram", url: "https://www.instagram.com/zz_annora" },
    ],
    name: "朱硯潤",
    romanized: "ZHŪ YÀNRÙN",
    note: "My name, signed and sealed — the way a painter finishes a painting.",
    hint: "Click anywhere in here to leave your own seal.",
    replies: ["One seal. Nice.", "Two. You get it.", "Three seals — you're one of us now.", "Okay, you really like stamps."],
    copyright: "© 2026 Annora Zhu",
    credit: "Hand-coded in Waterloo",
    landscape: true,
    seed: 12,
    mobileBreakpoint: 760,
}

addPropertyControls(SiteFooter, {
    eyebrow: { type: ControlType.String },
    heading: { type: ControlType.String, displayTextArea: true },
    email: { type: ControlType.String },
    links: {
        type: ControlType.Array,
        control: { type: ControlType.Object, controls: { label: { type: ControlType.String }, url: { type: ControlType.String } } },
    },
    name: { type: ControlType.String, title: "Signature" },
    romanized: { type: ControlType.String },
    note: { type: ControlType.String, displayTextArea: true },
    hint: { type: ControlType.String },
    replies: { type: ControlType.Array, control: { type: ControlType.String } },
    copyright: { type: ControlType.String },
    credit: { type: ControlType.String },
    landscape: { type: ControlType.Boolean, title: "Ink ridge" },
    seed: { type: ControlType.Number, min: 1, max: 999, step: 1, displayStepper: true, hidden: (p) => !p.landscape },
    mobileBreakpoint: { type: ControlType.Number, title: "Mobile below", min: 320, max: 1200 },
})
