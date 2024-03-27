import books from '../books.json'
import Book from './Book'

const BookList = () => {
  const recentBooks = books.slice(0, 3)

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          Browse Books
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentBooks.map((book) => (
            <Book key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default BookList
