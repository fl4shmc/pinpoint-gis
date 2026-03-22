import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { LoginPage } from "./pages/LoginPage/index";
import { RegisterPage } from "./pages/RegisterPage/index";
import { MapPage } from "./pages/MapPage/index";
import { RequireAuth } from "./features/auth/RequireAuth";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/map"
          element={
            <RequireAuth>
              <MapPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/map" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
