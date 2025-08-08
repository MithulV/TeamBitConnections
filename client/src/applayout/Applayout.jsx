import React from 'react'
import UserHome from '../pages/UserHome'
import Navbar from '../components/Navbar'
import { Route, Routes } from 'react-router-dom'
function Applayout() {
    return (
        <div className='h-screen flex'>
            <Navbar />
            <div className='w-full h-screen flex-1 overflow-x-hidden overflow-y-auto'>
                <Routes>
                    <Route path="/" element={<UserHome />} />
                </Routes>
            </div>
        </div>
    )
}

export default Applayout