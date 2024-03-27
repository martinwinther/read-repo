import { useState } from 'react'
const Book = ({ book }) => {
  const [showFullDescription, setShowFullDescription] = useState(false)

  let description = book.description.long

  if (!showFullDescription) {
    description = book.description.short
  }

  return (
    <div className="bg-white rounded-xl shadow-md relative">
      <div className="p-4">
        <div className="mb-6">
          <div className="text-gray-600 my-2">{book.genre}</div>
          <h3 className="text-xl font-bold">{book.title}</h3>
        </div>

        <div className="mb-5">{description}</div>

        <button
          onClick={() => setShowFullDescription((prevState) => !prevState)}
          className="text-indigo-500 mb-5 hover:text-indigo-50">
          {showFullDescription ? 'less' : 'More'}
        </button>

        <h3 className="text-indigo-500 mb-2">{book.isbn}</h3>

        <div className="border border-gray-100 mb-5"></div>

        <div className="flex flex-col lg:flex-row justify-between mb-4">
          <div className="text-orange-700 mb-3">
            <i className="fa-solid fa-location-dot text-lg"></i>
            {book.author}
          </div>
          <a
            href={`/book/${book.id}`}
            className="h-[36px] bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-center text-sm">
            Read More
          </a>
        </div>
      </div>
    </div>
  )
}

export default Book