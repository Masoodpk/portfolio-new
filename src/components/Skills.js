import React from 'react';

import {motion} from 'framer-motion'
import {fadeIn} from '../variants'
import { FaReact, FaHtml5, FaCss3Alt, FaBootstrap, FaGitAlt } from "react-icons/fa";
import { SiJavascript, SiTailwindcss, SiNetlify } from "react-icons/si";

const skills = [
  {
    name:'ReactJs',
    icon: <FaReact className="text-blue-500 text-[25px]" />, 
  
  },
  {
    name:'Javascript',
    icon: <SiJavascript className="text-yellow-500 text-[25px]" />,
  },
  {
    name:'HTML5',
    icon: <FaHtml5 className="text-orange-500 text-[25px]" />,
  },
  {
    name:'CSS3',
    icon: <FaCss3Alt className="text-blue-500 text-[25px]" />,
  },
  {
    name:'Tailwind CSS',
    icon: <SiTailwindcss className="text-teal-400 text-[25px]" />,
  },
  {
    name:'Bootstrap',
    icon: <FaBootstrap className="text-purple-600 text-[25px]" />,
  },
  {
    name:'Git',
    icon: <FaGitAlt className="text-orange-500 text-[25px]" />, 
  },
  {
    name:'Hosting',
    icon: <SiNetlify className="text-green-500 text-[25px]" />,
  },
]



const Skills = () => {
  return( 
  <div className='section' id='skills'>
  <div className='container mx-auto'>
    <motion.div     variants = {fadeIn('left',0.5)}
              initial='hidden'
              whileInView={'show'}
              viewport={{once:false,amount:0.3}}>
    <h2 className='h2 text-accent mb-6'>Skills</h2>
      </motion.div> 

<div>
{skills.map((skill, index)=>{
  const {name,icon}=skill;
return (
  <div className='border-b border-white/20 flex items-end justify-between' key={index}>
    <motion.div
     variants = {fadeIn('left',0.5)}
              initial='hidden'
              whileInView={'show'}
              viewport={{once:false,amount:0.3}}
             
              >
      <h4 className='text-[20px] tracking-wider font-primary font-semibold mt-9'> {name}</h4>
    </motion.div>
    <motion.div
    className='mb-1'
                  variants={fadeIn("right", 0.5)}
                  initial="hidden"
                  whileInView={"show"}
                  viewport={{ once: false, amount: 0.3 }}
                >
                  {icon}
                </motion.div>
  </div>
)
})}
</div>
  </div>


  </div>
)};

export default Skills;
