'use client';

import React from 'react'
import { useRouter } from 'next/navigation'
import Search from './Search'
import { Button } from './ui/button'
import Image from 'next/image'
import { signOut } from '@/lib/auth'

const Header = ({ email }) => {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
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