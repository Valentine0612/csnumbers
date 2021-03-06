import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop(props: ScrollToTopProps) {
    const changedState = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [changedState]);

    return <>{props.children}</>;
}

type ScrollToTopProps = {
    children: any;
};
