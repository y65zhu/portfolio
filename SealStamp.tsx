import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { loadDanXing, ZHU, PAPER } from "./Assets.tsx"

/**
 * Wraps your footer (connect it to "Content"). Clicking anywhere that isn't
 * a link drops a red seal where you clicked. Also renders the hint line.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function SealStamp(props) {
    const { content, sealText, hint, replies, max } = props
    const [seals, setSeals] = useState<{ x: number; y: number; r: number; id: number }[]>([])
    const count = useRef(0)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadDanXing()
    }, [])

    const onClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest("a, button")) return
        const r = ref.current.getBoundingClientRect()
        count.current++
        setSeals((s) => [...s, { x: e.clientX - r.left, y: e.clientY - r.top, r: Math.random() * 16 - 8, id: count.current }].slice(-max))
    }
    const line = count.current ? replies[Math.min(count.current, replies.length) - 1] : hint

    return (
        <div ref={ref} onClick={onClick} style={{ position: "relative", width: "100%", height: "100%", cursor: "crosshair" }}>
            <style>{`@keyframes seal-thunk { from { scale: 1.8; opacity: 0 } }`}</style>
            {content}
            <p style={{ position: "absolute", left: 0, bottom: 0, margin: 0, font: '12px "IBM Plex Mono", monospace', color: "#8f857a" }}>{line}</p>
            {seals.map((s) => (
                <span
                    key={s.id}
                    aria-hidden
                    style={{
                        position: "absolute", left: s.x, top: s.y, translate: "-50% -50%", rotate: `${s.r}deg`,
                        padding: "6px 4px", background: ZHU, color: PAPER, borderRadius: 3,
                        font: "22px/1.05 DanXing, serif", writingMode: "vertical-rl",
                        boxShadow: `inset 0 0 0 2px ${ZHU}, inset 0 0 0 3.5px ${PAPER}`,
                        mixBlendMode: "multiply", opacity: 0.92, pointerEvents: "none",
                        animation: "seal-thunk .35s cubic-bezier(.2,.9,.3,1.4) both",
                    }}
                >
                    {sealText}
                </span>
            ))}
        </div>
    )
}

SealStamp.defaultProps = {
    sealText: "硯潤",
    hint: "Click anywhere in here to leave your own seal.",
    replies: ["One seal. Nice.", "Two. You get it.", "Three seals — you're one of us now.", "Okay, you really like stamps."],
    max: 30,
}

addPropertyControls(SealStamp, {
    content: { type: ControlType.ComponentInstance, title: "Content" },
    sealText: { type: ControlType.String, title: "Seal text" },
    hint: { type: ControlType.String },
    replies: { type: ControlType.Array, control: { type: ControlType.String } },
    max: { type: ControlType.Number, min: 5, max: 100 },
})
