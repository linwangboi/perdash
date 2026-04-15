'use client';

import React from 'react'
import { useRouter } from 'next/navigation'
import Search from './Search'
import { Button } from './ui/button'
import Image from 'next/image'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

const Header = ({ email }) => {
  const router = useRouter()

  const handleSignOut = async () => {
    const refresh = window.localStorage.getItem('refresh')
    try {
      if (refresh) {
        await fetch(`${BASE_URL}/api/signout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        })
      }
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      window.localStorage.removeItem('access')
      window.localStorage.removeItem('refresh')
      router.push('/sign-in')
    }
  }

  return (
    <header className='header'>
      <Search />
      <div className='header-wrapper'>
        <Button type='button' onClick={handleSignOut} className='sign-out-button'>
          <Image
            src='/assets/logout.svg'
            alt='Sign out'
            width={24}
            height={24}
            className='w-6'
          />
        </Button>
      </div>
    </header>
  )
}

export default Header