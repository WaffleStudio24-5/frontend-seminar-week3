import "./App.css";
import { Link } from "react-router";
import type { Pages } from "./constants";

function Head({ page }: { page: Pages }) {
  return (
    <header>
      <h1>김다현의 천 개의 할 일</h1>
      <nav>
        {page !== "home" && <Link to="/">홈</Link>}
        {page !== "archive" && <Link to="/Archive">보관함</Link>}
        {page !== "settings" && <Link to="/settings">설정</Link>}
      </nav>
    </header>
  );
}

export default Head;
