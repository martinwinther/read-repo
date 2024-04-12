import { useState, useEffect } from 'react'
import Book from './Book'
import Spinner from './Spinner'

const BookList = ({ isHome = false }) => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      const apiUrl = isHome
        ? 'http://localhost:3000/books?_limit=3'
        : 'http://localhost:3000/books'
      try {
        const res = await fetch(apiUrl)
        const data = await res.json()
        setBooks(data)
      } catch (error) {
        console.log('Error fetching data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])
  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          {isHome ? 'Recent Books' : 'Browse Books'}
        </h2>

        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {books.map((book) => (
              <Book key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default BookList
