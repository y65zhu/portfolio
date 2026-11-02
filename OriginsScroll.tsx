import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { useSiteFonts } from "./HomeHero.tsx"
import { INK, ZHU } from "./Assets.tsx"
import InkScape from "./InkScape.tsx"

/**
 * "Where it started": the section pins to the screen and the cards slide
 * sideways as you scroll down, with a progress bar. It does its own pinning
 * (no Sticky / Scroll Transform needed), so it keeps working even when a
 * parent frame clips its content. Cards without a photo carry a small ink
 * painting from the site's landscape. Below the mobile breakpoint the cards
 * simply stack.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function OriginsScroll(props) {
    const { eyebrow, heading, cards, scrollLength, mobileBreakpoint, gutter } = props
    const rootRef = useRef<HTMLDivElement>(null)
    const pinRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const barRef = useRef<HTMLElement>(null)
    const [W, setW] = useState(1200)
    const mobile = W < mobileBreakpoint
    useSiteFonts()

    useEffect(() => {
        const el = rootRef.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => {
            const w = Math.round(e.contentRect.width)
            if (w > 50) setW((prev) => (Math.abs(prev - w) > 1 ? w : prev))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        if (mobile) return
        let raf = 0
        const update = () => {
            raf = 0
            const root = rootRef.current, pin = pinRef.current, track = trackRef.current
            if (!root || !pin || !track) return
            const vh = window.innerHeight
            const r = root.getBoundingClientRect()
            const travel = Math.max(1, r.height - vh)
            const pinned = Math.min(Math.max(-r.top, 0), travel)
            const p = pinned / travel
            const maxX = Math.max(0, track.scrollWidth - root.clientWidth)
            pin.style.transform = `translate3d(0, ${pinned}px, 0)`
            track.style.transform = `translate3d(${-p * maxX}px, 0, 0)`
            if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
        }
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update)
        }
        update()
        // capture: also hears scrolling of whatever element Framer scrolls
        addEventListener("scroll", onScroll, { capture: true, passive: true })
        addEventListener("resize", onScroll)
        return () => {
            removeEventListener("scroll", onScroll, { capture: true } as any)
            removeEventListener("resize", onScroll)
            cancelAnimationFrame(raf)
        }
    }, [mobile, cards.length])

    const panel = (c, i) => {
        const photoSrc = c.image?.src || c.imageUrl
        const photo = !!photoSrc
        return (
            <article
                key={i}
                style={{
                    flex: mobile ? "none" : `0 0 ${photo ? "min(640px, 86vw)" : "min(440px, 78vw)"}`,
                    minHeight: mobile ? 420 : 500,
                    position: "relative", padding: 34, boxSizing: "border-box",
                    background: "#f7f2e9", border: "1px solid #d3c8b6", borderRadius: 4,
                    display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden",
                }}
            >
                {photo && (
                    <div style={{ position: "absolute", inset: 0 }}>
                        <img src={photoSrc} alt={c.image?.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 30%, rgba(20,16,12,.78))" }} />
                    </div>
                )}
                {!photo && (
                    <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: "52%" }}>
                        <InkScape {...(InkScape as any).defaultProps} seed={c.seed || i * 17 + 3} sun={!!c.red} sunX={78} sunY={24} parallax={false} />
                    </div>
                )}
                <span style={{ position: "relative", font: '500 13px "IBM Plex Mono", monospace', letterSpacing: ".08em", color: photo ? "#f0a08f" : ZHU }}>
                    {c.label}
                </span>
                <h3 style={{ position: "relative", margin: "10px 0 14px", font: "400 32px/1.05 Fraunces, serif", color: photo ? "#efe7da" : INK }}>{c.title}</h3>
                <p style={{ position: "relative", margin: 0, font: "300 17px/1.6 Inter, sans-serif", color: photo ? "#e8dfd2" : "#5a524a" }}>{c.body}</p>
            </article>
        )
    }

    const head = (
        <div style={{ padding: `0 ${gutter}px`, marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
            <div>
                <p style={{ margin: "0 0 18px", font: '500 13px "IBM Plex Mono", monospace', letterSpacing: ".12em", textTransform: "uppercase", color: "#8f857a" }}>{eyebrow}</p>
                <h2 style={{ margin: 0, font: "400 clamp(36px, 5vw, 68px)/1.02 Fraunces, serif", letterSpacing: "-.02em", color: INK }}>{heading}</h2>
            </div>
            {!mobile && (
                <div style={{ width: 160, height: 2, background: "#d3c8b6", position: "relative", flexShrink: 0 }}>
                    <i ref={barRef} style={{ position: "absolute", inset: 0, background: ZHU, transformOrigin: "left", transform: "scaleX(0)" }} />
                </div>
            )}
        </div>
    )

    if (mobile) {
        return (
            <div ref={rootRef} style={{ width: "100%" }}>
                {head}
                <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: `0 ${gutter}px` }}>{cards.map(panel)}</div>
            </div>
        )
    }

    return (
        <div ref={rootRef} style={{ width: "100%", height: `${scrollLength}vh`, position: "relative", overflow: "hidden" }}>
            <div ref={pinRef} style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", willChange: "transform" }}>
                {head}
                <div ref={trackRef} style={{ display: "flex", gap: 28, padding: `0 ${gutter}px`, width: "max-content", willChange: "transform" }}>
                    {cards.map(panel)}
                </div>
            </div>
        </div>
    )
}

const C = (label, title, body, seed = 0, red = false) => ({ label, title, body, seed, red })

OriginsScroll.defaultProps = {
    eyebrow: "Where it started",
    heading: "I learned business before I knew it had a name.",
    scrollLength: 340,
    mobileBreakpoint: 760,
    gutter: 90,
    cards: [
        { imageUrl: "https://y65zhu.github.io/portfolio/beijing.jpg", ...C("01 / BEIJING", "Behind the counter.", "My family ran a restaurant and I helped watch the floor. You learn fast who wants to chat, who wants to be left alone, and who'll come back.") },
        C("02 / BOARDING SCHOOL", "Always a roommate.", "Years of living with other people taught me to read a room — and how to share one.", 21),
        C("03 / CANADA", "On my own.", "I moved here by myself for high school and learned to take care of — and stand up for — myself.", 34),
        C("04 / WATERLOO", "Business, meet art.", "Global Business & Digital Arts was the only program I'd ever seen that put the two things I'm good at in the same room.", 45, true),
    ],
}

addPropertyControls(OriginsScroll, {
    eyebrow: { type: ControlType.String },
    heading: { type: ControlType.String, displayTextArea: true },
    cards: {
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                image: { type: ControlType.ResponsiveImage, title: "Photo", description: "Optional — makes a wide photo card" },
                imageUrl: { type: ControlType.String, hidden: () => true },
                seed: { type: ControlType.Number, title: "Painting seed", min: 1, max: 999, step: 1, displayStepper: true },
                red: { type: ControlType.Boolean, title: "Vermilion sun" },
                label: { type: ControlType.String },
                title: { type: ControlType.String },
                body: { type: ControlType.String, displayTextArea: true },
            },
        },
    },
    scrollLength: { type: ControlType.Number, title: "Scroll length", min: 150, max: 600, unit: "vh" },
    gutter: { type: ControlType.Number, min: 0, max: 200 },
    mobileBreakpoint: { type: ControlType.Number, title: "Mobile below", min: 320, max: 1200 },
})
