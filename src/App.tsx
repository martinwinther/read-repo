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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/add-book" element={<AddBookPage />} />
      <Route path="/books/:id" element={<BookPage />} loader={bookLoader} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
)

const App = () => {
  return <RouterProvider router={router} />
}

export default App
