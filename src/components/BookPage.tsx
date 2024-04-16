import { useParams, useLoaderData } from 'react-router-dom'
import { FaArrowLeft, FaPen } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const BookPage = () => {
  const { id } = useParams()
  const book = useLoaderData()

  return (
    <>
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to="/Books"
            className="text-indigo-500 hover:text-indigo-600 flex items-center">
            <FaArrowLeft className="mr-2" />
            Back to Book Listings
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                <div className="text-gray-500 mb-4">{book.genre}</div>
                <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
                <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                  <FaPen className=" text-orange-700 mr-1" />
                  <p className="text-orange-700">{book.author}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">
                  Book Description
                </h3>

                <p className="mb-4">{book.description.long}</p>

                <h3 className="text-indigo-800 text-lg font-bold mb-2">
                  Audience
                </h3>

                <p className="mb-4">{book.audience}</p>
              </div>
            </main>

            <aside>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-6">Book Info</h3>

                <h2 className="text-xl font-bold">ISBN</h2>

                <p className="my-2">{book.isbn}</p>

                <h2 className="text-xl font-bold">Language</h2>

                <p className="my-2">{book.language}</p>

                <h2 className="text-xl font-bold">Location</h2>

                <p className="my-2">{book.location}</p>

                <h2 className="text-xl font-bold">Purchase Date</h2>

                <p className="my-2">{book.purchaseDate}</p>

                <h2 className="text-xl font-bold">Purchase Location</h2>

                <p className="my-2">{book.purchaseLocation}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-bold mb-6">Manage Book</h3>
                <Link
                  to={`/books/edit/${book}`}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block">
                  Edit Book
                </Link>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block">
                  Delete Book
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

const bookLoader = async ({ params }) => {
  const res = await fetch(`/api/books/${params.id}`)
  const data = await res.json()
  return data
}

export { BookPage as default, bookLoader }
