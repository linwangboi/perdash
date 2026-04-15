import Image from 'next/image'
import React from 'react'

const Search = () => {
  return (
    <div className='search'>
      <div className='search-input-wrapper'>
        <Image src='/assets/search.svg' alt='search' width={24} height={24} />

      </div>
      Search
    </div>
  )
}

export default Search