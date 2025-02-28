import React from 'react';
import { Layout } from 'antd';
import Header from './Header';
import HeroSection from './Herosection';
import PopularItemsCarousel from './PopularItemsCarousel'
import Process from './Process';
import Footer from './Footer';
import Special from './Specialfood';
import FeaturedMenus from './Featuredmenu';
import Chefs from './Chefs';
import Events from './Events';
import About from './About';
const layoutStyle = {
    overflow: 'hidden',
    width: 'calc(100%)',
    maxWidth: 'calc(100%)',
};
const Home = () => {
    return (
        <Layout style={layoutStyle}>
            <Header />
            <HeroSection />
            <Process />
            <PopularItemsCarousel />
            <FeaturedMenus />
            <Chefs />
            <About />
            <Special />
            <Events />
            <div id="contact"><Footer /></div>
        </Layout>
    );
};

export default Home;