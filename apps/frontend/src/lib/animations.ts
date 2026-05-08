// apps/frontend/src/lib/animations.ts

/* 
  انیمیشن‌های مشترک Framer Motion
  برای استفاده در کامپوننت‌ها با motion components
*/

export const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
};

export const slideUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
};

export const slideInRight = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const slideInLeft = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
};

export const springScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { type: 'spring', stiffness: 300, damping: 20 },
};

/* انیمیشن stagger برای لیست‌ها */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

/* انیمیشن hover برای کارت‌ها */
export const cardHover = {
  whileHover: {
    y: -6,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  whileTap: { scale: 0.98 },
};

/* انیمیشن دکمه */
export const buttonTap = {
  whileTap: { scale: 0.96 },
  whileHover: { scale: 1.02 },
  transition: { type: 'spring', stiffness: 500, damping: 30 },
};

/* انیمیشن page transition */
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
};

/* انیمیشن overlay/modal */
export const overlayAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const modalAnimation = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { type: 'spring', stiffness: 300, damping: 25 },
};
