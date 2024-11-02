import * as React from "react";

const IconSquarePlus = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M9 12h6"/>
        <path d="M12 9v6"/>
        <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"/>
    </svg>
);
export default IconSquarePlus;
