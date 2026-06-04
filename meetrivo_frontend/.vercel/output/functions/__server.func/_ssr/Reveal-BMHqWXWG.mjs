import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useReducedMotion, a as useInView, m as motion } from "../_libs/framer-motion.mjs";
function Reveal({
  children,
  delay = 0,
  className
}) {
  const ref = reactExports.useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const show = inView || reduceMotion;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      ref,
      className,
      initial: false,
      animate: { opacity: show ? 1 : 0, y: show ? 0 : 24 },
      transition: { duration: 0.5, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] },
      children
    }
  );
}
export {
  Reveal as R
};
