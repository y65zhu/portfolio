import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * A number that counts up from 0 the first time it scrolls into view.
 *
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function CountUp(props) {
    const { to, suffix, duration, font, color } = props
    const [n, setN] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(to)
        let raf = 0
        const io = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return
            io.disconnect()
            const t0 = performance.now()
            const step = (t) => {
                const p = Math.min(1, (t - t0) / (duration * 1000))
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
    }, [to, duration])

    return (
        <span ref={ref} style={{ ...font, color, fontVariantNumeric: "tabular-nums" }}>
            {n}
            {suffix}
        </span>
    )
}

CountUp.defaultProps = { to: 30, suffix: "+", duration: 1.4, color: "#231f1c" }

addPropertyControls(CountUp, {
    to: { type: ControlType.Number, min: 0, max: 100000 },
    suffix: { type: ControlType.String },
    duration: { type: ControlType.Number, min: 0.2, max: 5, step: 0.1, unit: "s" },
    font: { type: ControlType.Font, controls: "extended" },
    color: { type: ControlType.Color },
})
