import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const AddBookPage = ({ addBookSubmit }) => {
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('English')
  const [genre, setGenre] = useState('Fantasy')
  const [location, setLocation] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [isbn, setIsbn] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchaseLocation, setPurchaseLocation] = useState('')

  const navigate = useNavigate()

  const submitForm = (e) => {
    e.preventDefault()

    const newBook = {
      title,
      language,
      genre,
      location,
      isbn,
      purchaseDate,
      purchaseLocation,
      description: {
        short: shortDescription,
        long: longDescription,
      },
    }
    addBookSubmit(newBook)
    toast.success('Succesfully added the book')
    return navigate('/books')
  }

  return (
    <>
      <section className="bg-indigo-50">
        <div className="container m-auto max-w-2xl py-24">
          <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
            <form onSubmit={submitForm}>
              <h2 className="text-3xl text-center font-semibold mb-6">
                Add Book
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="language"
                  className="block text-gray-700 font-bold mb-2">
                  Book Language
                </label>
                <select
                  id="language"
                  name="language"
                  className="border rounded w-full py-2 px-3"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required>
                  <option value="English">English</option>
                  <option value="Danish">Danish</option>
                  <option value="French">French</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-gray-700 font-bold mb-2">
                  Book Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="border rounded w-full py-2 px-3"
                  placeholder="e.g., 1984"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="short_description"
                  className="block text-gray-700 font-bold mb-2">
                  Short Description
                </label>
                <textarea
                  id="short_description"
                  name="short_description"
                  className="border rounded w-full py-2 px-3"
                  rows="4"
                  placeholder="A brief description of the book"
                  value={shortDescription}
                  onChange={(e) =>
                    setShortDescription(e.target.value)
                  }></textarea>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="genre"
                  className="block text-gray-700 font-bold mb-2">
                  Genre
                </label>
                <select
                  id="genre"
                  name="genre"
                  className="border rounded w-full py-2 px-3"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  required>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Romance">Romance</option>
                  <option value="Western">Western</option>
                  <option value="Dystopian">Dystopian</option>
                  <option value="Horror">Horror</option>
                  <option value="Literary Fiction">Literary Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="location"
                  className="block text-gray-700 font-bold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="border rounded w-full py-2 px-3"
                  placeholder="e.g., attic box 4"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <h3 className="text-2xl mb-5">Book Info</h3>

              <div className="mb-4">
                <label
                  htmlFor="isbn"
                  className="block text-gray-700 font-bold mb-2">
                  ISBN
                </label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  className="border rounded w-full py-2 px-3"
                  placeholder="ISBN"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="long_description"
                  className="block text-gray-700 font-bold mb-2">
                  Long Description
                </label>
                <textarea
                  id="long_description"
                  name="long_description"
                  className="border rounded w-full py-2 px-3"
                  rows="4"
                  placeholder="A more detailed description"
                  value={longDescription}
                  onChange={(e) =>
                    setLongDescription(e.target.value)
                  }></textarea>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="purchase_date"
                  className="block text-gray-700 font-bold mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  id="purchase_date"
                  name="purchase_date"
                  className="border rounded w-full py-2 px-3"
                  placeholder="Select purchase date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="purchase_location"
                  className="block text-gray-700 font-bold mb-2">
                  Purchase Location (optional)
                </label>
                <input
                  type="text"
                  id="purchase_location"
                  name="purchase_location"
                  className="border rounded w-full py-2 px-3"
                  placeholder="e.g., Bookstore, online"
                  value={purchaseLocation}
                  onChange={(e) => setPurchaseLocation(e.target.value)}
                />
              </div>

              <div>
                <button
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                  type="submit">
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default AddBookPage
