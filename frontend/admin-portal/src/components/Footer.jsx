import React from 'react';

const Footer = () => (
    <footer className="py-12 bg-navy text-white text-center px-4 mt-20">
        <p className="font-medium leading-relaxed opacity-80">
            <span className="block md:inline">
                &copy; {new Date().getFullYear()}{' '}
                <span className="font-bold text-white">Shreyansh Srivastava</span>
            </span>
            <span className="hidden md:inline"> · </span>
            <span className="block md:inline uppercase tracking-wider text-xs md:text-sm md:normal-case font-bold md:font-medium">
                For Algorithmist Academy
            </span>
        </p>
    </footer>
);

export default Footer;
