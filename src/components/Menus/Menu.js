import React from 'react';
import Header from '../Home/Header';
import Footer from '../Home/Footer';
import MenuInfo from "./Menuinfo";
import SearchBar from './Searchbar';
import MenuList from './Menulist';


const Menus = () => {
    return (
        <div>
            <Header/>
            
            <MenuInfo/>
            <MenuList/>
            <Footer/>
        </div>
    );
};

export default Menus;