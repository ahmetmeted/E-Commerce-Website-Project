import React from 'react'
import { Footer, Navbar } from "../components";
const AboutPage = () => {
  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">About Us</h1>
        <hr />
        <p className="lead text-center">
        Welcome to OZU Store, your ultimate online destination for quality and convenience. 
        Established in 2024, our mission is to deliver an array of top-notch products right to your 
        doorstep. Whether you're shopping for the latest gadgets, fashionable apparel, or essential home 
        goods, our carefully curated selection meets the highest standards of quality and value. We are 
        committed to providing a seamless shopping experience with customer service that's just as 
        dependable as our products. At OZU Store, we believe in making your online shopping 
        experience effortless and enjoyable. Shop with us today and discover the excellence we bring to 
        every order!
        </p>

        
      </div>
      <Footer />
    </>
  )
}

export default AboutPage