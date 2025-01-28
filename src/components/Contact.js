import React from 'react';

import {motion} from 'framer-motion';
import { fadeIn } from '../variants';
import { FaPhoneAlt } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
const Contact = () => {
  return(

   <section className='mt-[120px] lg:section lg:mt-[700px]' id='contact'>
<div className='container mx-auto'>
  <div className='flex flex-col lg:flex-row'>
    <motion.div
       variants = {fadeIn('right',0.3)}
                        initial='hidden'
                        whileInView={'show'}
                        viewport={{once:false,amount:0.3}} 
    className='flex-1 flex flex-col justify-start pb-[50px]'>
      <div>
        <h4 className='text-xl uppercase text-accent font-medium mb-2 tracking-wide'>Get in touch</h4>
        <h2 className='text-[45px] lg:text-[90px] leading-none mb-12'>Let's Work <br />together!</h2>
      </div>
      <div className='flex pl-3 gap-4 text-[25px] '>
      <a href="tel:+9656554444">
    <FaPhoneAlt className='cursor-pointer hover:text-blue-500 transition-colors duration-300' />
  </a>
  <a href="https://wa.me/9656554444" target="_blank" rel="noopener noreferrer">
    <FaWhatsapp className='cursor-pointer hover:text-green-500 transition-colors duration-300' />
  </a>
</div>
    </motion.div>

    <motion.form
      variants = {fadeIn('left',0.3)}
      initial='hidden'
      whileInView={'show'}
      viewport={{once:false,amount:0.3}} 
    className='flex-1 border rounded-2xl flex flex-col gap-y-6 pb-24 p-6 items-start'>
      <input className='bg-transparent border-b py-3 outline-none w-full placeholder:text-white focus:border-accent transition-all'
       type="text"
       placeholder='Your name'  />
          <input className='bg-transparent border-b py-3 outline-none w-full placeholder:text-white focus:border-accent transition-all'
       type="text"
       placeholder='Your email'  />
       <textarea className='bg-transparent border-b py-12 outline-none w-full placeholder:text-white focus:border-accent transition-all resize-none mb-12' placeholder='Your message'></textarea>
       <button className='btn btn-lg'>Send message</button>
    </motion.form>
  </div>

</div>




   </section>
  )
};

export default Contact;
