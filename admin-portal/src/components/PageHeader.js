import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, description }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 pt-8"
    >
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-navy">
            {title}
        </h1>
        {description && (
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                {description}
            </p>
        )}
        <div className="w-24 h-1.5 bg-lime mx-auto rounded-full mt-8" />
    </motion.div>
);

export default PageHeader;
