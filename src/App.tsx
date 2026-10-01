import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Archive from "./Archive";
import Home from "./Home";
import Settings from "./Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="Archive" element={<Archive />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
