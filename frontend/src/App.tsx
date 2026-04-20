import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"
import DashboardPage from "./module/dashboard"
import ItemsPage from "./module/items"
import InvoicePage from "./module/invoice"

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/invoice" element={<InvoicePage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
