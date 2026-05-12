import { animate, useInView, useMotionValue, useTransform } from "framer-motion";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toString().padStart(2, "0"));

  useEffect(() => {
    if (inView) {
      const ctrl = animate(count, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
      return () => ctrl.stop();
    }
  }, [inView, count, to]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{rounded}</motion.span>
      <span className="text-accent">{suffix}</span>
    </span>
  );
}
