import { motion } from "framer-motion";
import theme from "../../utils/theme";

function Loader() {
  return (
    <motion.div
      className="flex justify-center items-center min-h-screen"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <div
        className="w-12 h-12 border-4 rounded-full"
        style={{ borderColor: `${theme.colors.primary.main} transparent transparent transparent` }}
      />
    </motion.div>
  );
}

export default Loader;
