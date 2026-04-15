

import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'
import Sidebar from '@/components/Sidebar'
import React from 'react'

const layout = async ({children}) => {
  return (
    <main className='flex h-screen'>
        <Sidebar firstName={'Test'} email={'example@gmail.com'} />
        <section className='flex h-full flex-1 flex-col'>
            <MobileNav />
            <Header email={'example@gmail.com'} />
            <div className='main-content'>{children}</div>
        </section>
    </main>
  )
}

export default layout