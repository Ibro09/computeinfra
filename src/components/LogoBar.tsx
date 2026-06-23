import { motion } from "motion/react";

export default function LogoBar() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="bg-white border-y border-gray-100 py-0 select-none overflow-hidden" id="logo-branding-bar">
      <div className="max-w-7xl mx-auto px-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 divide-x divide-gray-100 border-x border-gray-100"
        >
          {/* Label section */}
          <div className="p-8 flex items-center justify-center bg-gray-50/50 col-span-2 sm:col-span-1 min-h-[110px]">
            <span className="font-mono text-[9px] font-bold tracking-widest text-gray-400 uppercase leading-relaxed text-center">
              //WE'VE TRUSTED BY
            </span>
          </div>

          {/* Logo 1 */}
          <motion.div
            variants={itemVariants}
            className="p-8 flex items-center justify-center hover:bg-gray-50/30 transition-colors duration-200 group min-h-[110px]"
          >
            <svg
              className="h-7 w-auto fill-gray-400 group-hover:fill-black transition-colors duration-300"
              viewBox="0 0 160 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 4 L28 4 L34 14 L20 34 L4 34 L10 24 Z" className="fill-brand-neon-dark opacity-80 group-hover:opacity-100" />
              <path d="M22 6 L38 6 L44 16 L30 36 L14 36 Z" className="mix-blend-multiply fill-gray-900" />
              <text x="56" y="26" className="font-sans font-black text-lg tracking-tightest fill-gray-900">Solana</text>
            </svg>
          </motion.div>

         
        </motion.div>
      </div>
    </section>
  );
}
