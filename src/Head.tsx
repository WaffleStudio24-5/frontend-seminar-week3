import { useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import "./App.css";

function NavLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: string;
  label: string;
}) {
  return (
    <Button
      render={<Link to={to} />}
      className="bg-cyan-800 text-white hover:bg-cyan-900 font-light"
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </Button>
  );
}

function Head() {
  const { pathname } = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const page =
    pathname.replace(/\/$/, "").split("/").pop()?.toLowerCase() || "home";

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const resizeObserver = new ResizeObserver(() => {
      setHeaderHeight(header.getBoundingClientRect().height);
    });
    resizeObserver.observe(header);
    setHeaderHeight(header.getBoundingClientRect().height);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 z-50 flex w-full flex-col gap-4 bg-cyan-500 p-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <h1 className="font-bold text-5xl">김다현의 천 개의 할 일</h1>
        <nav className="flex flex-wrap gap-3 lg:ml-auto" aria-label="주 메뉴">
          {page !== "home" && <NavLink to="/" icon="🏠" label="홈" />}
          {page !== "archive" && (
            <NavLink to="/archive" icon="📦" label="보관함" />
          )}
          {page !== "settings" && (
            <NavLink to="/settings" icon="⚙️" label="설정" />
          )}
        </nav>
      </header>
      <div aria-hidden="true" style={{ height: headerHeight }} />
    </>
  );
}

export default Head;
