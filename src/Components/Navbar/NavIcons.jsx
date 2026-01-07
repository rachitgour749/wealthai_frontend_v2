import React from 'react';
import { Assets } from '../../assets/Assets';

const NavIcons = ({ setCurrentPage }) => {
    return (
        <>
            <img
                src={Assets.whatsapp}
                className='w-[22px] h-[22px] cursor-pointer hover:scale-110 transition-transform'
                onClick={() => window.open('https://wa.me/9717074506', '_blank')}
                alt="WhatsApp"
            />
            <img
                src={Assets.home}
                className='w-[22px] h-[22px] cursor-pointer hover:scale-110 transition-transform'
                onClick={() => setCurrentPage('Home')}
                alt="Home"
            />
        </>
    );
};

export default NavIcons;
