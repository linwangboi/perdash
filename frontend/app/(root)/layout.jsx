
'use client'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'
import Sidebar from '@/components/Sidebar'
import React, { useState, useEffect } from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

const layout = ({children}) => {
  const [userData, setUserData] = useState({ firstName: 'User', email: 'loading...' })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const access = window.localStorage.getItem('access');

        if (access) {
          const response = await fetch(`${BASE_URL}/api/user/profile/`, {
            headers: {
              'Authorization': `Bearer ${access}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          })

          if (response.ok) {
            const data = await response.json()
            setUserData({
              firstName: data.first_name || 'User',
              email: data.email || 'example@gmail.com',
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      }
    }

    fetchUserData()
  }, [])

  return (
    <main className='flex h-screen'>
        <Sidebar firstName={userData.firstName} email={userData.email} />
        <section className='flex h-full flex-1 flex-col'>
            <MobileNav />
            <Header email={userData.email} />
            <div className='main-content'>{children}</div>
        </section>
    </main>
  )
}

export default layout