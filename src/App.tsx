import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import BooksPage from './pages/BooksPage'
import NotFoundPage from './pages/NotFoundPage'
import BookPage, { bookLoader } from './components/BookPage'
import AddBookPage from './pages/AddBookPage'

const App = () => {
  // Add new book
  const addBook = async (newBook) => {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'aaplication/json',
      },
      body: JSON.stringify(newBook),
    })
    return
  }

  // Delete book
  const deleteBook = async (bookId) => {
    const res = await fetch(`/api/books/${bookId}`, {
      method: 'DELETE',
    })
    return
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route
          path="/add-book"
          element={<AddBookPage addBookSubmit={addBook} />}
        />
        <Route
          path="/books/:id"
          element={<BookPage deleteBook={deleteBook} />}
          loader={bookLoader}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    )
  )
  return <RouterProvider router={router} />
}

export default App
