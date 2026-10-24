const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');

// Generate unique booking reference e.g. IM-839201
function generateReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'IM-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

// POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { showtimeId, seats } = req.body;
    if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'Showtime and at least one seat selection are required' });
    }

    const showtime = await Showtime.findById(showtimeId).populate('movie');
    if (!showtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }

    // Verify all requested seats exist in this showtime
    const seatMap = new Map(showtime.seats.map(s => [s.seatNumber, s]));
    for (const seatNum of seats) {
      const s = seatMap.get(seatNum);
      if (!s) {
        return res.status(400).json({ error: `Seat ${seatNum} is not part of this screen layout` });
      }
      if (s.isBooked) {
        return res.status(409).json({ error: `Seat ${seatNum} has already been booked. Please choose other seats.` });
      }
    }

    // Concurrency-safe atomic reservation:
    // Update seats ONLY if none of the selected seats have isBooked: true
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        seats: {
          $not: {
            $elemMatch: {
              seatNumber: { $in: seats },
              isBooked: true,
            },
          },
        },
      },
      {
        $set: {
          'seats.$[elem].isBooked': true,
          'seats.$[elem].bookedBy': req.user.id,
        },
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: seats } }],
        returnDocument: 'after',
      }
    );

    if (!updatedShowtime) {
      return res.status(409).json({
        error: 'One or more selected seats were reserved just now by another guest. Please select different seats.',
      });
    }

    const pricePerTicket = showtime.price || 15.00;
    const totalAmount = seats.length * pricePerTicket;
    let bookingReference = generateReference();

    // Ensure uniqueness of reference
    let existingRef = await Booking.findOne({ bookingReference });
    while (existingRef) {
      bookingReference = generateReference();
      existingRef = await Booking.findOne({ bookingReference });
    }

    const booking = new Booking({
      bookingReference,
      user: req.user.id,
      movie: showtime.movie._id,
      showtime: showtime._id,
      seats,
      totalAmount,
      status: 'confirmed',
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('showtime')
      .lean();

    res.status(201).json({
      message: 'Booking confirmed successfully (Demo Reservation)',
      booking: populatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie')
      .populate('showtime')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
    })
      .populate('movie')
      .populate('showtime')
      .lean();

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Release seats in Showtime
    await Showtime.updateOne(
      { _id: booking.showtime },
      {
        $set: {
          'seats.$[elem].isBooked': false,
          'seats.$[elem].bookedBy': null,
        },
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: booking.seats } }],
      }
    );

    booking.status = 'cancelled';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('showtime')
      .lean();

    res.json({
      message: 'Booking cancelled successfully and seats released',
      booking: updatedBooking,
    });
  } catch (err) {
    next(err);
  }
};
