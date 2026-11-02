import { useEffect, useRef, useState } from "react"
import * as Framer from "framer"
import { addPropertyControls, ControlType } from "framer"
import { INK, ZHU, PAPER } from "./Assets.tsx"
import InkPortrait from "./InkPortrait.tsx"
import InkScape from "./InkScape.tsx"

const useFramerRouter: () => any = (Framer as any).useRouter || (() => null)
const FONTS = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500&display=swap"
/** Makes sure the site's three Google fonts are on the page, even if no native text uses them. */
export function useSiteFonts() {
    useEffect(() => {
        if (document.querySelector(`link[href="${FONTS}"]`)) return
        const l = document.createElement("link")
        l.rel = "stylesheet"
        l.href = FONTS
        document.head.appendChild(l)
    }, [])
}

export function useNavigate() {
    const router = useFramerRouter()
    return (e: React.MouseEvent, link: string) => {
        if (!link || !link.startsWith("/") || e.metaKey || e.ctrlKey || !router?.routes) return
        const parts = link.split(/[?#]/)[0].split("/").filter(Boolean)
        for (const [id, r] of Object.entries<any>(router.routes)) {
            const rp = (r.path || "").split("/").filter(Boolean)
            if (rp.length !== parts.length) continue
            const vars: Record<string, string> = {}
            if (rp.every((seg, k) => (seg.startsWith(":") ? ((vars[seg.slice(1)] = parts[k]), true) : seg === parts[k]))) {
                e.preventDefault()
                router.navigate(id, undefined, vars)
                return
            }
        }
    }
}

/**
 * The home page's first screen, laid out as one piece so the proportions
 * hold: headline and intro on the left, the ink portrait on the right at a
 * true 3:4 with its caption underneath, and a far ink ridge behind both.
 * Stacks on narrow screens.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function HomeHero(props) {
    const { kicker, before, emphasis, after, lead, primary, primaryLink, secondary, secondaryLink, photo, photoUrl, caption, captionTouch, captionNote, landscape, seed, mobileBreakpoint } = props
    const ref = useRef<HTMLDivElement>(null)
    const [W, setW] = useState(1200)
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

    const src = photo?.src || photoUrl
    const gutter = mobile ? "20px" : "clamp(24px, 6vw, 90px)"

    return (
        <header ref={ref} style={{ position: "relative", width: "100%", overflow: "hidden", color: INK }}>
            {landscape && (
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: mobile ? "18%" : "27%", opacity: 0.55, pointerEvents: "none" }}>
                    <InkScape {...(InkScape as any).defaultProps} seed={seed} sun={false} water={false} />
                </div>
            )}
            <div
                style={{
                    position: "relative", display: "grid", boxSizing: "border-box", maxWidth: 1440, margin: "0 auto",
                    gridTemplateColumns: mobile ? "1fr" : "minmax(0, 1.1fr) minmax(0, .9fr)",
                    gap: mobile ? 44 : "clamp(40px, 6vw, 110px)", alignItems: "center",
                    minHeight: mobile ? 0 : "100vh", padding: `${mobile ? 110 : 130}px ${gutter} ${mobile ? 64 : 90}px`,
                }}
            >
                <div>
                    <p style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 28px", font: '500 13px "IBM Plex Mono", monospace', letterSpacing: ".04em", color: "#5a524a" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5f9b6a", boxShadow: "0 0 0 4px rgba(95,155,106,.18)" }} />
                        {kicker}
                    </p>
                    <h1 style={{ margin: 0, font: `400 ${mobile ? "50px" : "clamp(56px, 6.6vw, 112px)"}/.96 Fraunces, serif`, letterSpacing: "-.028em" }}>
                        {before}
                        <em style={{ fontStyle: "italic", fontWeight: 300, color: ZHU }}>{emphasis}</em>
                        {after}
                    </h1>
                    <p style={{ margin: "32px 0 0", maxWidth: "34ch", font: `300 ${mobile ? 17 : 19}px/1.6 Inter, sans-serif`, color: "#5a524a" }}>{lead}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 22, marginTop: 36 }}>
                        <a
                            href={primaryLink}
                            onClick={(e) => go(e, primaryLink)}
                            style={{ padding: "14px 22px", borderRadius: 999, background: INK, color: PAPER, textDecoration: "none", font: "500 15px Inter, sans-serif" }}
                        >
                            {primary}
                        </a>
                        <a
                            href={secondaryLink}
                            onClick={(e) => go(e, secondaryLink)}
                            style={{ color: INK, textDecoration: "none", borderBottom: "1px solid #d3c8b6", paddingBottom: 3, font: "400 15px Inter, sans-serif" }}
                        >
                            {secondary}
                        </a>
                    </div>
                </div>
                <figure style={{ margin: 0, width: "100%", maxWidth: mobile ? 460 : "min(100%, calc((100vh - 280px) * .75))", justifySelf: mobile ? "center" : "end" }}>
                    <div style={{ aspectRatio: "3 / 4", width: "100%" }}>
                        {src && <InkPortrait {...(InkPortrait as any).defaultProps} image={{ src, alt: photo?.alt || "Annora" }} />}
                    </div>
                    <figcaption style={{ marginTop: 16, display: "grid", gap: 6 }}>
                        <span style={{ font: '500 13px "IBM Plex Mono", monospace', color: ZHU }}>{mobile ? captionTouch : `↖ ${caption}`}</span>
                        <span style={{ font: "300 15px/1.55 Inter, sans-serif", color: "#5a524a" }}>{captionNote}</span>
                    </figcaption>
                </figure>
            </div>
        </header>
    )
}

HomeHero.defaultProps = {
    kicker: "Open to marketing & product internships",
    before: "I listen for what people ",
    emphasis: "don't",
    after: " say.",
    lead: "Marketing & product-minded designer studying Global Business & Digital Arts at the University of Waterloo.",
    primary: "See my work →",
    primaryLink: "/work",
    secondary: "More about me",
    secondaryLink: "/about",
    photoUrl: "https://y65zhu.github.io/portfolio/me-crop.jpg",
    caption: "Move your cursor over me — it's a camera lens.",
    captionTouch: "Drag a finger over me — it's a camera lens.",
    captionNote: "Up close, the portrait is written rather than drawn: hundreds of brushed characters for listen, heart, light and people.",
    landscape: true,
    seed: 5,
    mobileBreakpoint: 900,
}

addPropertyControls(HomeHero, {
    kicker: { type: ControlType.String },
    before: { type: ControlType.String, title: "Headline" },
    emphasis: { type: ControlType.String, title: "Red italic" },
    after: { type: ControlType.String, title: "Headline end" },
    lead: { type: ControlType.String, displayTextArea: true },
    primary: { type: ControlType.String, title: "Button" },
    primaryLink: { type: ControlType.String, title: "Button link" },
    secondary: { type: ControlType.String, title: "Link" },
    secondaryLink: { type: ControlType.String, title: "Link to" },
    photo: { type: ControlType.ResponsiveImage, description: "Leave empty to use me-crop.jpg. The built-in matte only fits that photo." },
    caption: { type: ControlType.String },
    captionTouch: { type: ControlType.String, title: "Caption (phone)" },
    captionNote: { type: ControlType.String, title: "Caption note", displayTextArea: true },
    landscape: { type: ControlType.Boolean, title: "Ink ridge" },
    seed: { type: ControlType.Number, min: 1, max: 999, step: 1, displayStepper: true, hidden: (p) => !p.landscape },
    mobileBreakpoint: { type: ControlType.Number, title: "Stack below", min: 320, max: 1400 },
})
