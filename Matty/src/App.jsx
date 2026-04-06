import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ChallengePage from './pages/ChallengePage'
import MultiplicationChallenge from './features/multiplication/MultiplicationChallenge'
import CalculationChallenge from './features/calculation/CalculationChallenge'
import AdditionChallenge from './features/addition/AdditionChallenge'
import OperatorChallenge from './features/operator/OperatorChallenge'
import FractionChallenge from './features/fraction/FractionChallenge'
import MazeChallenge from './features/maze/MazeChallenge'
import AlgebraChallenge from './features/algebra/AlgebraChallenge'
import GeometryChallenge from './features/geometry/GeometryChallenge'
import SequenceChallenge from './features/sequence/SequenceChallenge'
import { LocaleProvider } from './store/LocaleContext'
import './styles/App.css'

function App() {
  return (
    <LocaleProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/challenge/multiplication" element={<MultiplicationChallenge />} />
        <Route path="/challenge/calculation"    element={<CalculationChallenge />} />
        <Route path="/challenge/addition"       element={<AdditionChallenge />} />
        <Route path="/challenge/operator"       element={<OperatorChallenge />} />
        <Route path="/challenge/fractions"      element={<FractionChallenge />} />
        <Route path="/challenge/maze"           element={<MazeChallenge />} />
        <Route path="/challenge/algebra"        element={<AlgebraChallenge />} />
        <Route path="/challenge/geometry"       element={<GeometryChallenge />} />
        <Route path="/challenge/sequence"       element={<SequenceChallenge />} />
        <Route path="/challenge/:id" element={<ChallengePage />} />
      </Routes>
    </LocaleProvider>
  )
}

export default App
