import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import NotReadyPage from './pages/NotReadyPage'
import { LocaleProvider } from './store/LocaleContext'
import { UserProvider } from './store/UserContext'
import './styles/App.css'

const MultiplicationChallenge = lazy(() => import('./features/multiplication/MultiplicationChallenge'))
const CalculationChallenge    = lazy(() => import('./features/calculation/CalculationChallenge'))
const AdditionChallenge       = lazy(() => import('./features/addition/AdditionChallenge'))
const OperatorChallenge       = lazy(() => import('./features/operator/OperatorChallenge'))
const FractionChallenge       = lazy(() => import('./features/fraction/FractionChallenge'))
const MazeChallenge           = lazy(() => import('./features/maze/MazeChallenge'))
const AlgebraChallenge        = lazy(() => import('./features/algebra/AlgebraChallenge'))
const GeometryChallenge       = lazy(() => import('./features/geometry/GeometryChallenge'))
const SequenceChallenge       = lazy(() => import('./features/sequence/SequenceChallenge'))
const PairingChallenge        = lazy(() => import('./features/pairing/PairingChallenge'))
const ColorMatchChallenge     = lazy(() => import('./features/colormatch/ColorMatchChallenge'))
const AnimalChallenge         = lazy(() => import('./features/animal/AnimalChallenge'))

function App() {
  return (
    <UserProvider>
      <Suspense fallback={null}>
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
            <Route path="challenge/animal"         element={<AnimalChallenge />} />
            <Route path="challenge/:id"            element={<NotReadyPage />} />
          </Route>
        </Routes>
      </Suspense>
    </UserProvider>
  )
}

export default App
