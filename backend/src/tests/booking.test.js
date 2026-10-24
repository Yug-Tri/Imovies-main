const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Cinema = require('../models/Cinema');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'bookingtestsecret';
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe('Movie & Booking flow', () => {
  const user = { email: 'cinemafan@imovies.com', password: 'Password123' };

  test('lists movies and creates booking atomically', async () => {
    // 1. Create a test movie
    const movie = await Movie.create({
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.',
      genre: ['Sci-Fi', 'Adventure'],
      rating: 8.6,
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
      duration: 166,
      isFeatured: true,
    });

    // 2. Create a test showtime with seats A1, A2, A3
    const showtime = await Showtime.create({
      movie: movie._id,
      theater: 'IMAX Laser Hall 1',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      price: 16.50,
      seats: [
        { seatNumber: 'A1', row: 'A', col: 1, isBooked: false, price: 16.50 },
        { seatNumber: 'A2', row: 'A', col: 2, isBooked: false, price: 16.50 },
        { seatNumber: 'A3', row: 'A', col: 3, isBooked: false, price: 16.50 },
      ],
    });

    // 3. Register a user and get session agent
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(user);

    // 4. Test listing movies
    const moviesRes = await request(app).get('/api/movies');
    expect(moviesRes.status).toBe(200);
    expect(moviesRes.body.movies.length).toBe(1);
    expect(moviesRes.body.movies[0].title).toBe('Dune: Part Two');

    // 5. Test movie detail with showtimes
    const detailRes = await request(app).get(`/api/movies/${movie._id}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.showtimes.length).toBe(1);

    // 6. Book seat A1 and A2
    const bookingRes = await agent.post('/api/bookings').send({
      showtimeId: showtime._id,
      seats: ['A1', 'A2'],
    });
    expect(bookingRes.status).toBe(201);
    expect(bookingRes.body.booking.bookingReference).toMatch(/^IM-/);
    expect(bookingRes.body.booking.seats).toEqual(['A1', 'A2']);
    expect(bookingRes.body.booking.totalAmount).toBe(33.00);

    const bookingId = bookingRes.body.booking._id;

    // 7. Attempt double booking for seat A1 - MUST FAIL with 409 Conflict
    const agent2 = request.agent(app);
    await agent2.post('/api/auth/register').send({ email: 'rival@imovies.com', password: 'Password123' });
    const doubleBookRes = await agent2.post('/api/bookings').send({
      showtimeId: showtime._id,
      seats: ['A1'],
    });
    expect(doubleBookRes.status).toBe(409);
    expect(doubleBookRes.body.error).toBeDefined();

    // 8. User checks their bookings
    const myBookingsRes = await agent.get('/api/bookings/my-bookings');
    expect(myBookingsRes.status).toBe(200);
    expect(myBookingsRes.body.bookings.length).toBe(1);
    expect(myBookingsRes.body.bookings[0].bookingReference).toBe(bookingRes.body.booking.bookingReference);

    // 9. User cancels booking
    const cancelRes = await agent.post(`/api/bookings/${bookingId}/cancel`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.booking.status).toBe('cancelled');

    // 10. After cancellation, seats A1 and A2 must be free again for another user
    const rebookRes = await agent2.post('/api/bookings').send({
      showtimeId: showtime._id,
      seats: ['A1'],
    });
    expect(rebookRes.status).toBe(201);
  });
});
