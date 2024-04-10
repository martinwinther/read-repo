import BookList from '../components/BookList'
import Hero from '../components/Hero'
import HomeCards from '../components/HomeCards'
import ViewAllBooks from '../components/ViewAllBooks'

const HomePage = () => {
  return (
    <div>
      <>
        <Hero />
        <HomeCards />
        <BookList isHome={true} />
        <ViewAllBooks />
      </>
    </div>
  )
}

export default HomePage
