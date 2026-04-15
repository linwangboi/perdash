import React from 'react'
import Search from './Search'
import { Button } from './ui/button';
import Image from 'next/image';

const Header = ({email}) => {
  return (
    <header className='header'>
      <Search />
      <div className='header-wrapper'>
        <form action={async () => {'use server'; }}>
          <Button type='submit' className='sign-out-button'>
            <Image src='/assets/logout.svg' alt='logo' width={24} height={24} className='w-6' />
          </Button>
        </form>
      </div>
    </header>
  )
}

export default Header