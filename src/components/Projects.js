import React, { useState }  from "react";
import { FaGithub } from "react-icons/fa";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

import { motion } from "framer-motion";
import { fadeIn } from "../variants";
import cofee from "../assets/cofee.png";
import explore from "../assets/explore.png";
import nike from "../assets/nike.png";
import netflix from "../assets/netflix.png";
import mediplus from "../assets/mediplus.png";
import byb from "../assets/byb.png";
import aster from "../assets/aster.png";
import portfolio from "../assets/portfolio.png";
const Projects = () => {
  const [showMore, setShowMore] = useState(false);

  const toggleProjects = () => {
    setShowMore(!showMore);
  };

  
  return (
    <section className="section mt-[100px] lg:mt-[650px] " id="projects" >

      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-x-10">
          <motion.div
            variants={fadeIn("right", 0.5)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.3 }}
            className="flex-1 flex flex-col gap-y-[74px] mb-10 lg:mb-0"
          >
            <div>
              <h2 className="h2 leading-tight text-accent">My Latest Work</h2>
              <p className=" mb-16 lg:w-[400px]">
                I focus on crafting responsive frontend designs and developing
                robust full-stack applications. My projects emphasize intuitive
                user experiences and efficient, scalable solutions tailored to
                meet diverse requirements.
              </p>
              {/* <button className="btn btn-sm">View all projects</button> */}
            </div>
            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl lg:w-full md:w-[500px] m-auto ">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500 h-[180px] lg:h-[315px]  md:h-[250px] "
                src={cofee}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">Frontend</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Coffee Brew</span>
              </div>

              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-24 transition-all duration-500 z-50">
               <a href="https://github.com/Masoodpk/Coffee-Brew-landing-page" target="_blank" rel="noopener noreferrer"><FaGithub className="text-white text-2xl cursor-pointer" /></a> 
              </div>
              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-14 transition-all duration-500 z-50">
               <a href="https://coffeebreww.netlify.app/" target="_blank" rel="noopener noreferrer"><HiArrowTopRightOnSquare  className="text-white text-2xl cursor-pointer" /></a> 
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={fadeIn("left", 0.5)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.3 }}
            className="flex-1 flex flex-col gap-y-10 "
          >
            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl lg:w-full md:w-[500px] m-auto">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500 h-[180px] lg:h-[315px]  md:h-[250px]"
                src={explore}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">Frontend</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Explore Destination</span>
              </div>

              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-24 transition-all duration-500 z-50">
               <a href="https://github.com/Masoodpk/Explore-Destination-Landing-page" target="_blank" rel="noopener noreferrer"><FaGithub className="text-white text-2xl cursor-pointer" /></a> 
              </div>
              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-14 transition-all duration-500 z-50">
               <a href="https://exploredestination.netlify.app/" target="_blank" rel="noopener noreferrer"><HiArrowTopRightOnSquare  className="text-white text-2xl cursor-pointer" /></a> 
              </div>

            </div>

            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl lg:w-full md:w-[500px] m-auto">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500 h-[180px] lg:h-[315px]  md:h-[250px]"
                src={nike}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">ReactJS</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Nike Landing Page</span>
              </div>

              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-24 transition-all duration-500 z-50">
               <a href="https://github.com/Masoodpk/Nike-landing-page" target="_blank" rel="noopener noreferrer"><FaGithub className="text-white text-2xl cursor-pointer" /></a> 
              </div>
           
            </div>
          </motion.div>
        </div>




        {showMore && (
        <div className="flex flex-col lg:flex-row gap-x-10 lg:mt-[50px] mt-[50px]">
          <motion.div
            variants={fadeIn("right", 0.5)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.3 }}
            className="flex-1 flex flex-col gap-y-[44px] mb-10 lg:mb-0"
          >
            {/* <div>
              <h2 className="h2 leading-tight text-accent">My Latest Work</h2>
              <p className=" mb-16 lg:w-[400px]">
              I focus on crafting responsive frontend designs and developing robust full-stack applications. My projects emphasize intuitive user experiences and efficient, scalable solutions tailored to meet diverse requirements.
              </p>
         
            </div> */}
            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl lg:w-full md:w-[500px] m-auto ">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500 h-[180px] lg:h-[315px]  md:h-[250px] "
                src={mediplus}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">Frontend</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Mediplus</span>
              </div>

              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-24 transition-all duration-500 z-50">
               <a href="https://github.com/Masoodpk/MediPlus" target="_blank" rel="noopener noreferrer"><FaGithub className="text-white text-2xl cursor-pointer" /></a> 
              </div>
             
            </div>
            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl lg:w-full md:w-[500px] m-auto ">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500 h-[180px] lg:h-[315px]  md:h-[250px] "
                src={netflix}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">ReactJS</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Netflix-Clone</span>
              </div>

              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-24 transition-all duration-500 z-50">
               <a href="https://github.com/Masoodpk/React_Netflix_App" target="_blank" rel="noopener noreferrer"><FaGithub className="text-white text-2xl cursor-pointer" /></a> 
              </div>
           
            </div>
          </motion.div>
          <motion.div
            variants={fadeIn("left", 0.5)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.3 }}
            className="flex-1 flex flex-col gap-y-10 "
          >
            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl lg:w-full md:w-[500px] m-auto">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500 h-[180px] lg:h-[315px]  md:h-[250px]"
                src={byb}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">Frontend</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">BYB</span>
              </div>
              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-24 transition-all duration-500 z-50">
               <a href="https://github.com/Masoodpk/BYB" target="_blank" rel="noopener noreferrer"><FaGithub className="text-white text-2xl cursor-pointer" /></a> 
              </div>
              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-14 transition-all duration-500 z-50">
               <a href="https://byb-gamma.vercel.app/" target="_blank" rel="noopener noreferrer"><HiArrowTopRightOnSquare  className="text-white text-2xl cursor-pointer" /></a> 
              </div>
           
              
            </div>

            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl lg:w-full md:w-[500px] m-auto">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500 h-[180px] lg:h-[315px]  md:h-[250px]"
                src={aster}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">ReactJS</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Aster-Pharma</span>
              </div>
              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-24 transition-all duration-500 z-50">
               <a href="https://github.com/Masoodpk/AsterPharmacy-test" target="_blank" rel="noopener noreferrer"><FaGithub className="text-white text-2xl cursor-pointer" /></a> 
              </div>
            </div>

            
          </motion.div>
        </div>


)}



{showMore && (
        <div className="flex flex-col lg:flex-row gap-x-10 lg:mt-[50px] mt-[50px]">
          <motion.div
            variants={fadeIn("right", 0.5)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.3 }}
            className="flex-1 flex flex-col gap-y-[44px] mb-10 lg:mb-0"
          >
            
            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl  md:w-[500px] lg:w-1/2 m-auto ">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500 h-[180px] lg:h-[315px]  md:h-[250px] "
                src={portfolio}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">ReactJS</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Portfolio</span>
              </div>

              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-24 transition-all duration-500 z-50">
               <a href="https://github.com/Masoodpk/portfolio" target="_blank" rel="noopener noreferrer"><FaGithub className="text-white text-2xl cursor-pointer" /></a> 
              </div>
              <div className="absolute bottom-[-40px] right-12 transform group-hover:bottom-14 transition-all duration-500 z-50">
               <a href="https://masoodpk-portfolio.netlify.app/" target="_blank" rel="noopener noreferrer"><HiArrowTopRightOnSquare  className="text-white text-2xl cursor-pointer" /></a> 
              </div>
             
            </div>
         
          </motion.div>
        </div>

)}




<div className="text-center mt-10">
          <button
            className="btn btn-lg"
            onClick={toggleProjects}
          >
            {showMore ? "View Less" : "View More"}
          </button>
        </div>



        
      </div>
    </section>
  );
};

export default Projects;




























