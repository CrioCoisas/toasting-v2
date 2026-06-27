// Page transition for the voucher flow: the same gentle crossfade the
// onboarding screens use, slowed a touch, with a soft hint of blur. Symmetric,
// so it needs no direction tracking.
export const pageFade = {
  initial: { opacity: 0, filter: 'blur(4px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(4px)' },
  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
}
