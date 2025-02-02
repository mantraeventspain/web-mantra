export const ArtistShowcase = () => {
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8">Artistas Destacados</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="text-center hover:transform hover:scale-105 transition-transform duration-300"
          >
            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden mb-4">
              <img
                src={`https://source.unsplash.com/400x400/?dj,artist&random=${item}`}
                alt="Artista"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold">DJ {item}</h3>
            <p className="text-gray-400">Resident DJ</p>
          </div>
        ))}
      </div>
    </div>
  );
};
