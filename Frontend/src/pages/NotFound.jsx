import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function NotFound() {
  return (
    <div className='min-h-screen bg-background-main'>
      <Navbar/>
      <section className="container mx-auto p-spacing-lg text-center">
        <h1 className='text-3xl font-sans font-bold text-text-primary mb-spacing-md'>
          404 - Page Not Found
        </h1>
        <p className='text-text-secondary font-sans'>
          The Page you are looking for does not exist
        </p>
      </section>
      <Footer/>
    </div>
  )
}

export default NotFound