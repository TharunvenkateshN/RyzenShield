import React from 'react';
import { motion } from 'framer-motion';

const ShieldToggle = ({ isActive, toggle }) => {
    return (
        <button
            onClick={toggle}
            className={`
                relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none
                ${isActive ? 'bg-orange-600' : 'bg-neutral-700'}
            `}
        >
            <motion.div
                layout
                className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md"
                animate={{ x: isActive ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </button>
    );
};

export default ShieldToggle;
