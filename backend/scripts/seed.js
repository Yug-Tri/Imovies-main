const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}
const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const Movie = require('../src/models/Movie');
const Showtime = require('../src/models/Showtime');
const Cinema = require('../src/models/Cinema');
const User = require('../src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';

const sampleCinemas = [
  {
    name: 'iMovies Grand Luxe - Downtown',
    address: '100 Broadway Avenue, Theater District',
    city: 'New York',
  },
  {
    name: 'iMovies IMAX Sphere - West End',
    address: '45 Sunset Boulevard',
    city: 'Los Angeles',
  },
  {
    name: 'iMovies Neo Cinema - Cyber Central',
    address: '88 Tech Park Way',
    city: 'San Francisco',
  },
];

const sampleMovies = [
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: ['Biography', 'Drama', 'History'],
    rating: 8.9,
    posterUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1600&auto=format&fit=crop&q=80',
    duration: 180,
    releaseDate: '2023-07-21',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    isFeatured: true,
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    rating: 8.7,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
    duration: 166,
    releaseDate: '2024-03-01',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    isFeatured: true,
  },
  {
    title: 'Interstellar: 10th Anniversary',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers.',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    rating: 8.7,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80',
    duration: 169,
    releaseDate: '2014-11-07',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    isFeatured: true,
  },
  {
    title: 'Blade Runner 2049',
    description: 'Young Blade Runner K discovers a long-buried secret that leads him to track down former Blade Runner Rick Deckard, who has been missing for thirty years.',
    genre: ['Sci-Fi', 'Mystery', 'Action'],
    rating: 8.0,
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80',
    duration: 164,
    releaseDate: '2017-10-06',
    director: 'Denis Villeneuve',
    cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas', 'Sylvia Hoeks'],
    trailerUrl: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
    isFeatured: false,
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre: ['Action', 'Crime', 'Drama'],
    rating: 9.0,
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1600&auto=format&fit=crop&q=80',
    duration: 152,
    releaseDate: '2008-07-18',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    isFeatured: false,
  },
  {
    title: 'Spirited Away',
    description: 'During her family’s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    genre: ['Animation', 'Adventure', 'Family'],
    rating: 8.6,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    duration: 125,
    releaseDate: '2001-07-20',
    director: 'Hayao Miyazaki',
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
    trailerUrl: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    isFeatured: false,
  },
  {
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    genre: ['Drama', 'Thriller'],
    rating: 8.5,
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop&q=80',
    duration: 132,
    releaseDate: '2019-10-11',
    director: 'Bong Joon Ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
    trailerUrl: 'https://www.youtube.com/watch?v=5xH0RZEhtPM',
    isFeatured: false,
  },
  {
    title: 'Arrival',
    description: 'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.',
    genre: ['Drama', 'Mystery', 'Sci-Fi'],
    rating: 7.9,
    posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80',
    duration: 116,
    releaseDate: '2016-11-11',
    director: 'Denis Villeneuve',
    cast: ['Amy Adams', 'Jeremy Renner', 'Forest Whitaker', 'Michael Stuhlbarg'],
    trailerUrl: 'https://www.youtube.com/watch?v=tFMo3UJ4B4g',
    isFeatured: false,
  },
];

function buildSeatGrid(rows = 6, cols = 8, price = 16.00) {
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seats = [];
  for (let r = 0; r < rows; r++) {
    const row = rowLetters[r];
    for (let c = 1; c <= cols; c++) {
      // 10% chance a seat is already reserved for realism
      const isPrebooked = (r === 2 && (c === 3 || c === 4)) || (r === 3 && c === 5);
      seats.push({
        seatNumber: `${row}${c}`,
        row,
        col: c,
        isBooked: isPrebooked,
        price,
      });
    }
  }
  return seats;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected! Purging and reseeding...');

  await Movie.deleteMany({});
  await Showtime.deleteMany({});
  await Cinema.deleteMany({});
  await User.deleteMany({});

  // Seed Users
  const admin = new User({
    email: 'admin@imovies.com',
    name: 'Chief Cinema Admin',
    role: 'admin',
  });
  await admin.setPassword('AdminPass123!');
  await admin.save();

  const demoUser = new User({
    email: 'user@imovies.com',
    name: 'Alex Rivera',
    role: 'user',
  });
  await demoUser.setPassword('UserPass123!');
  await demoUser.save();

  console.log('Seeded Users (admin@imovies.com / AdminPass123! and user@imovies.com / UserPass123!)');

  // Seed Cinemas
  const cinemas = await Cinema.insertMany(sampleCinemas);
  console.log(`Seeded ${cinemas.length} Cinemas`);

  // Seed Movies
  const movies = await Movie.insertMany(sampleMovies);
  console.log(`Seeded ${movies.length} Movies`);

  // Seed Showtimes for each movie
  const showtimes = [];
  const now = new Date();

  const times = [
    { hour: 13, min: 30, format: 'Dolby Cinema', price: 17.50 },
    { hour: 16, min: 45, format: 'IMAX 4K Laser', price: 19.00 },
    { hour: 20, min: 15, format: 'IMAX 4K Laser', price: 19.00 },
    { hour: 22, min: 30, format: 'Standard 4K', price: 14.50 },
  ];

  for (const movie of movies) {
    for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
      for (let tIdx = 0; tIdx < 2; tIdx++) {
        const timeConfig = times[(movie.title.length + tIdx + dayOffset) % times.length];
        const showDate = new Date(now);
        showDate.setDate(showDate.getDate() + dayOffset);
        showDate.setHours(timeConfig.hour, timeConfig.min, 0, 0);

        const cinema = cinemas[(dayOffset + tIdx) % cinemas.length];

        showtimes.push({
          movie: movie._id,
          cinema: cinema._id,
          theater: `${cinema.name} - Screen ${tIdx + 1}`,
          format: timeConfig.format,
          price: timeConfig.price,
          startTime: showDate,
          seats: buildSeatGrid(6, 8, timeConfig.price),
        });
      }
    }
  }

  await Showtime.insertMany(showtimes);
  console.log(`Seeded ${showtimes.length} Showtimes with interactive seat grids`);

  console.log('Seed completed successfully!');
  await mongoose.disconnect();
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seed;
