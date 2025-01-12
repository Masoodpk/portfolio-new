import React from 'react';

import {motion} from 'framer-motion'
import {fadeIn} from '../variants'
import Img1 from "../assets/portfolio-img1.png" 
const Projects = () => {
  return( 
  <section className='section' id='projects'>
<div className='container mx-auto'>
  <div>
    <div className='flex-1 flex flex-col gap-y-12 mb-10 lg:mb-0'>
      <div>
        <h2 className='h2 leading-tight text-accent'>
          My Latest Work</h2>
          <p className='max-w-sm mb-16'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti magnam facere similique ea exercitationem temporibus porro, excepturi et repellendus doloribus dolorem provident nesciunt, voluptatem natus neque quo pariatur ratione reprehenderit?</p>
          <button className='btn btn-sm'>View all projects</button>
      </div>
      <div className='group relative overflow-hidden border-2 border-white/50 rounded-xl'>
        <div></div>
        <img src={Img1} alt="img" />
        <div>UI/UX Design</div>
        <div>
          <span>Project Title</span>
        </div>
      </div>
    </div>
    <div>2</div>
  </div>

</div>



  </section>
  

)
};

export default Projects;
