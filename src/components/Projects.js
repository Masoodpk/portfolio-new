import React from "react";

import { motion } from "framer-motion";
import { fadeIn } from "../variants";
import Img1 from "../assets/portfolio-img1.png";
import Img2 from "../assets/portfolio-img2.png";
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
              <p className="max-w-sm mb-16">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Deleniti magnam facere similique ea exercitationem temporibus
                porr.
              </p>
              <button className="btn btn-sm">View all projects</button>
            </div>
            <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500"
                src={Img1}
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
          <motion.div 
           variants = {fadeIn('left',0.5)}
                    initial='hidden'
                    whileInView={'show'}
                    viewport={{once:false,amount:0.3}} 
          className="flex-1 flex flex-col gap-y-10 ">
          <div className="group relative overflow-hidden border-2 border-white/50 rounded-xl">
              <div className="group-hover:bg-black/70 w-full h-full absolute z-40 transition-all duration-300"></div>
              <img
                className="group-hover:scale-125 transition-all duration-500"
                src={Img2}
                alt="img"
              />
              <div className="absolute -bottom-full left-12 group-hover:bottom-24 transiton-all duration-500 z-50">
                <span className="text-gradient">UI/UX Design</span>
              </div>
              <div className="absolute -bottom-full left-12 group-hover:bottom-14 transiton-all duration-700 z-50">
                <span className="text-3xl text-white">Project Title</span>
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
