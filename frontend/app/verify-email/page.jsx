import React, { Suspense } from 'react'
import VerifyEmail from './VerifyEmail'

const page = () => {
  return (
    <Suspense fallback={
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-lg text-muted-foreground'>Loading...</p>
      </div>
    }>
      <VerifyEmail />
    </Suspense>
  )
}

export default page