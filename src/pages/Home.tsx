import React from 'react';
import { motion } from 'framer-motion';

export const Home = () => {
  return (
    <div className="relative min-h-screen">
      {/* Video de fondo */}
      <div className="absolute inset-0 w-full h-screen">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="object-cover w-full h-full"
          poster="https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&q=80"
        >
          <source
            src="URL_DE_TU_VIDEO"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-screen flex items-center justify-center text-white"
      >
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Experiencias Techno Únicas
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Descubre los mejores eventos de música electrónica
          </p>
          <a
            href="/events"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors"
          >
            Ver Próximos Eventos
          </a>
        </div>
      </motion.div>
    </div>
  );
};