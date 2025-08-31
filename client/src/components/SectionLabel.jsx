import React from "react";

const SectionLabel = ({ isOpen, text }) => (
  <div
    className={`${
      isOpen ? "px-3" : "px-0"
    } text-[11px] uppercase tracking-wider text-white/70 mt-3 mb-1`}
  >
    {isOpen ? text : <span className="sr-only">{text}</span>}
  </div>
);

export default SectionLabel;