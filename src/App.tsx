import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './Header/Header'
import TaskForm from './TaskForm/TaskForm'
import Login from './Login/Login'
import Profile from './Profile/Profile'

function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route 
            path='/tasks'
            element = {<TaskForm />}
          />
          <Route 
            path='/Login'
            element = {<Login />}
          />
          <Route 
            path='/profile'
            element = {<Profile />}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
