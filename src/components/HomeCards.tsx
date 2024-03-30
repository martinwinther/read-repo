import { Link } from 'react-router-dom'
import Card from './Card'

const HomeCards = () => {
  return (
    <section className="py-4">
      <div className="container-xl lg:container m-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <Card>
            <h2 className="text-2xl font-bold">See All Books</h2>
            <p className="mt-2 mb-4">
              Browse your books and find something to read
            </p>
            <Link
              to="/books"
              className="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700">
              Browse Books
            </Link>
          </Card>
          <Card bg="bg-indigo-100">
            <h2 className="text-2xl font-bold">Add New Book</h2>
            <p className="mt-2 mb-4">Add your book to save it for later</p>
            <Link
              to="/add-book"
              className="inline-block bg-indigo-500 text-white rounded-lg px-4 py-2 hover:bg-indigo-600">
              Add Book
            </Link>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default HomeCards
