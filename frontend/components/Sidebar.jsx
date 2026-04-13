'use client'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Sidebar = ({firstName, email}) => {
  return (
    <aside className='sidebar'>
        <Link href='/'>
            <Image src='/assets/logo-full.svg' alt='logo' width={160} height={50} className='hidden h-auto lg:block'/>
            <Image src='/assets/logo-full-red.svg' alt='logo' width={52} height={55} className='lg:hidden'/>
        </Link>
        <nav className='sidebar-nav'>
            <ul className='flex flex-col gap-6 flex-1'>
                
            </ul>
        </nav>
    </aside>
  )
}

export default Sidebar