import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import NotReadyPage from './pages/NotReadyPage'
import MultiplicationChallenge from './features/multiplication/MultiplicationChallenge'
import CalculationChallenge from './features/calculation/CalculationChallenge'
import AdditionChallenge from './features/addition/AdditionChallenge'
import OperatorChallenge from './features/operator/OperatorChallenge'
import FractionChallenge from './features/fraction/FractionChallenge'
import MazeChallenge from './features/maze/MazeChallenge'
import AlgebraChallenge from './features/algebra/AlgebraChallenge'
import GeometryChallenge from './features/geometry/GeometryChallenge'
import SequenceChallenge from './features/sequence/SequenceChallenge'
import PairingChallenge from './features/pairing/PairingChallenge'
import ColorMatchChallenge from './features/colormatch/ColorMatchChallenge'
import { LocaleProvider } from './store/LocaleContext'
import { UserProvider } from './store/UserContext'
import './styles/App.css'

function App() {
  return (
    <UserProvider>
    <Routes>
      <Route path="/" element={<Navigate to="/da" replace />} />
      <Route path="/:locale" element={<LocaleProvider />}>
        <Route index element={<Home />} />
        <Route path="challenge/multiplication" element={<MultiplicationChallenge />} />
        <Route path="challenge/calculation"    element={<CalculationChallenge />} />
        <Route path="challenge/addition"       element={<AdditionChallenge />} />
        <Route path="challenge/operator"       element={<OperatorChallenge />} />
        <Route path="challenge/fractions"      element={<FractionChallenge />} />
        <Route path="challenge/maze"           element={<MazeChallenge />} />
        <Route path="challenge/algebra"        element={<AlgebraChallenge />} />
        <Route path="challenge/geometry"       element={<GeometryChallenge />} />
        <Route path="challenge/sequence"       element={<SequenceChallenge />} />
        <Route path="challenge/pairing"        element={<PairingChallenge />} />
        <Route path="challenge/colormatch"     element={<ColorMatchChallenge />} />
        <Route path="challenge/:id"            element={<NotReadyPage />} />
      </Route>
    </Routes>
    </UserProvider>
  )
}

export default App
