import { useParams, useLoaderData } from 'react-router-dom'

const BookPage = () => {
  const { id } = useParams()
  const book = useLoaderData()

  return <h1>{book.title}</h1>
}

const bookLoader = async ({ params }) => {
  const res = await fetch(`/api/books/${params.id}`)
  const data = await res.json()
  return data
}

export { BookPage as default, bookLoader }
