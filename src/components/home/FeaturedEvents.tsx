export const FeaturedEvents = () => {
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8 text-mantra-gold text-center">
        Eventos Destacados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-mantra-blue rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300"
          >
            <img
              src={`https://source.unsplash.com/800x600/?techno,party&random=${item}`}
              alt="Evento"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-mantra-gold">
                Evento {item}
              </h3>
              <p className="text-gray-300">
                Una experiencia única de música electrónica
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
