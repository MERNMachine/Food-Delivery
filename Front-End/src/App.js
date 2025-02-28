import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/Home/Home';
import Menus from './components/Menus/Menu';
import MenuDetails from './components/MenuDetails/Menudetails';
import Cart from './components/Cart/Cart';
import Checkout from "./components/Checkout/Checkout";
import Confirm from './components/Confirm/confirm';
import Feedback from './components/About_Us/Feedback';
import Trackorder from './components/TrackOrder/Trackorder';
import Login from './components/Auth/Login';
import { Provider } from 'react-redux';
import store from './redux/store';

function App() {
  return (
    <Provider store = {store}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/tracking" element={<Trackorder />} />
          <Route path="/payment" element={<Checkout />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/menu" element={<Menus />} />
          <Route path="/menu/:id" element={<MenuDetails />} />
        </Routes>
      </Router>
    </Provider>


  );
}

export default App;
