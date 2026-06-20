import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Home } from "@/app/(public)/Home";
import { Login } from "@/app/(public)/Login";
import { Cadastro } from "@/app/(public)/Cadastro";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
        </Route>

        {/* ── Auth routes (placeholder) ─────────────────── */}
        <Route path="/app" element={<h1>Área logada (em construção)</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
