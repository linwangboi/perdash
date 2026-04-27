
'use client'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'
import Sidebar from '@/components/Sidebar'
import React, { useState, useEffect } from 'react'
import { clearTokens, fetchWithAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

const layout = ({children}) => {
  const [userData, setUserData] = useState({ firstName: 'User', email: 'loading...' })
  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth(`${BASE_URL}/api/user/profile/`, {
          cache: 'no-store',
        })

        if (response.ok) {
          const data = await response.json()
          setUserData({
            firstName: data.first_name || 'User',
            email: data.email || 'example@gmail.com',
          })
        } else {
          clearTokens();
          router.push('/sign-in');
          return;
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        clearTokens();
        router.push('/sign-in');
        return;
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
            <Toaster />
        </section>
    </main>
  )
}

export default layout