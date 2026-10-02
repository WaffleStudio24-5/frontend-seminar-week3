import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "@/components/ui/toast";
import Archive from "./archive/Archive";
import { ThemeProvider } from "./components/ThemeProvider";
import Home from "./home/Home";
import Settings from "./Settings";

function App() {
  return (
    <ThemeProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="Archive" element={<Archive />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
