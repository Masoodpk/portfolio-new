import React from "react";

import { motion } from "framer-motion";
import { fadeIn } from "../variants";
import cofee from "../assets/cofee.png";
import explore from "../assets/explore.png";
import Img3 from "../assets/portfolio-img3.png";
const Projects = () => {



  
  return (
    <section className="section mt-[100px] lg:mt-[150px]" id="projects">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-x-10">
          <motion.div
           variants = {fadeIn('right',0.5)}
                    initial='hidden'
                    whileInView={'show'}
                    viewport={{once:false,amount:0.3}} 
          className="flex-1 flex flex-col gap-y-[87px] mb-10 lg:mb-0">
            <div>
              <h2 className="h2 leading-tight text-accent">My Latest Work</h2>
              <p className=" mb-16">
              I focus on crafting responsive frontend designs and developing robust full-stack applications. My projects emphasize intuitive user experiences and efficient, scalable solutions tailored to meet diverse requirements.
              </p>
              <button className="btn btn-sm">View all projects</button>
            </div>
            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500 h-[180px] lg:h-[315px]"
                src={cofee}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">Frontend</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Coffee Brew</span>
              </div>
            </div>
          </motion.div>
          <motion.div 
           variants = {fadeIn('left',0.5)}
                    initial='hidden'
                    whileInView={'show'}
                    viewport={{once:false,amount:0.3}} 
          className="flex-1 flex flex-col gap-y-10 ">
          <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500 h-[180px] lg:h-[315px]"
                src={explore}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">Frontend</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Explore Destination</span>
              </div>
            </div>

            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500"
                src={Img3}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">UI/UX Design</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Project Title</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>  
    </section>
  );
};

export default Projects;
