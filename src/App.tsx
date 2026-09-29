import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Collections from "./Collections";
import Home from "./Home";
import Settings from "./Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="collections" element={<Collections />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
