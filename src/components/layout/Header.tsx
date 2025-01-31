import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingCart, Music } from 'lucide-react';

export const Header = () => {
  return (
    <header className="fixed w-full z-50 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Music className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">TechnoEvents</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-white hover:text-purple-400">Eventos</Link>
            <Link to="/shop" className="text-white hover:text-purple-400">Tienda</Link>
            <Link to="/gallery" className="text-white hover:text-purple-400">Galería</Link>
            <Link to="/cart" className="text-white hover:text-purple-400">
              <ShoppingCart className="w-6 h-6" />
            </Link>
          </div>
          
          <button className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </div>
    </header>
  );
};