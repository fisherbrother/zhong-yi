import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Formulas } from './pages/Formulas'
import { FormulaDetail } from './pages/FormulaDetail'
import { Herbs } from './pages/Herbs'
import { HerbDetail } from './pages/HerbDetail'
import { Meridians } from './pages/Meridians'
import { MeridianDetail } from './pages/MeridianDetail'
import { Acupoints } from './pages/Acupoints'
import { AcupointDetail } from './pages/AcupointDetail'
import { Favorites } from './pages/Favorites'
import { Notes } from './pages/Notes'
import { Profile } from './pages/Profile'
import { DataImport } from "./pages/DataImport";
import { FormulaCompare } from './pages/FormulaCompare'

function App() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* 主要应用路由 */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="formulas" element={<Layout><Formulas /></Layout>} />
      <Route path="formulas/:id" element={<Layout><FormulaDetail /></Layout>} />
      <Route path="formulas/compare" element={<Layout><FormulaCompare /></Layout>} />
      <Route path="herbs" element={<Layout><Herbs /></Layout>} />
      <Route path="herbs/:id" element={<Layout><HerbDetail /></Layout>} />
      <Route path="meridians" element={<Layout><Meridians /></Layout>} />
      <Route path="meridians/:id" element={<Layout><MeridianDetail /></Layout>} />
      <Route path="acupoints" element={<Layout><Acupoints /></Layout>} />
      <Route path="acupoints/:id" element={<Layout><AcupointDetail /></Layout>} />
      <Route path="favorites" element={<Layout><Favorites /></Layout>} />
      <Route path="notes" element={<Layout><Notes /></Layout>} />
      <Route path="profile" element={<Layout><Profile /></Layout>} />
      <Route path="import-data" element={<Layout><DataImport /></Layout>} />
      
      {/* 404重定向 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
