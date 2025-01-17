import React from 'react';
import { BiHomeAlt, BiUser } from 'react-icons/bi';
import { BsClipboardData, BsBriefcase, BsChatSquareText } from 'react-icons/bs';

import { Link } from 'react-scroll';

const Nav = () => {
  return (
    <nav className="fixed bottom-2 lg:bottom-8 w-full overflow-hidden z-50">
      <div className="container mx-auto ">
        <div className="w-full bg-black/20 h-[96px] backdrop-blur-2xl rounded-full max-w-[460px] mx-auto px-5 flex justify-between items-center text-2xl text-white/50 :">
        <Link 
  to="home" 
  activeClass="active" 
  smooth={true} 
  offset={-200} 
  className="cursor-pointer w-[60px] h-[60px] rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
>
  <BiHomeAlt />
</Link>
<Link 
  to="home" 
  activeClass="active" 
  smooth={true} 
  offset={-200} 
  className="cursor-pointer w-[60px] h-[60px] rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
>
            <BiUser />
          </Link>
          <Link 
  to="home" 
  activeClass="active" 
  smooth={true} 
  offset={-200} 
  className="cursor-pointer w-[60px] h-[60px] rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
> 
            <BsClipboardData />
          </Link>
          <Link 
  to="home" 
  activeClass="active" 
  smooth={true} 
  offset={-200} 
  className="cursor-pointer w-[60px] h-[60px] rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
>
            <BsBriefcase />
          </Link>
          <Link 
  to="home" 
  activeClass="active" 
  smooth={true} 
  offset={-200} 
  className="cursor-pointer w-[60px] h-[60px] rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
> 
            <BsChatSquareText />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
