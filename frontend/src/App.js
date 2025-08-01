import './App.css';
import Signup from "./components/signup";
import Login from "./components/login";
import { Route, Routes } from 'react-router-dom';
import Home from './components/home';
import NavBar from "./components/Navbar";
import Profile from './components/profile';
import EditProfile from './components/editprofile';
import Footer from './components/Footer';
import Test from './components/Test';
import CreateProfile from './components/CreateProfile';
import Browse from './components/Browse';
import PostOpportunity from './components/PostOpportunity';
import PublicProfile from './components/PublicProfile';
import About from './components/About';
import ChatPage from './components/ChatPage';
import MessagesPage from './components/MessagesPage';

function App() {
  return (
    <div className="App">
        <NavBar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path='/profile' element={<Profile/>}/>
        <Route path='edit-profile' element={<EditProfile/>} />
        <Route path='/test' element={<Test />} />
        <Route path='/create-profile' element={<CreateProfile />} />
        <Route path='/browse' element= {<Browse />} />
        <Route path='/post' element= {<PostOpportunity />} />
        <Route path="/public-profile/:userId" element={<PublicProfile />} />
        <Route path='/about' element={<About />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
        <Route path="/messages" element={<MessagesPage />} />

      </Routes>
      <Footer />
    </div>
  );
}

export default App;
