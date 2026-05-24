import { prisma } from '../lib/prisma.js';

type BookingType = 'FIXED' | 'ROTATIONAL' | 'DAY_PASS';
type SeatStatus = 'AVAILABLE' | 'BOOKED' | 'OCCUPIED_TODAY' | 'MAINTENANCE';
import { endOfDay, startOfDay } from '../lib/utils.js';

export async function getSeatAvailability(date: Date) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const seats = await prisma.seat.findMany({
    orderBy: [{ row: 'asc' }, { col: 'asc' }],
    include: {
      assignedTo: { select: { id: true, name: true, photo: true } },
      bookings: {
        where: {
          date: { gte: dayStart, lte: dayEnd },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
        include: { user: { select: { id: true, name: true, photo: true } } },
      },
      subscriptions: {
        where: { status: 'ACTIVE', endDate: { gte: new Date() } },
        include: {
          user: { select: { id: true, name: true, photo: true } },
          plan: true,
        },
      },
    },
  });

  return seats.map((seat) => {
    let displayStatus: SeatStatus = seat.status as SeatStatus;
    const fixedSub = seat.subscriptions.find((s) => s.plan.type === 'FIXED');
    const rotationalBooking = seat.bookings.find((b) => b.type === 'ROTATIONAL' || b.type === 'DAY_PASS');

    if (seat.status === 'MAINTENANCE') {
      displayStatus = 'MAINTENANCE';
    } else if (fixedSub) {
      displayStatus = 'BOOKED';
    } else if (rotationalBooking) {
      const isToday = dayStart.toDateString() === new Date().toDateString();
      displayStatus = isToday ? 'OCCUPIED_TODAY' : 'BOOKED';
    } else {
      displayStatus = 'AVAILABLE';
    }

    return {
      ...seat,
      displayStatus,
      fixedHolder: fixedSub?.user ?? seat.assignedTo,
      todayBooking: rotationalBooking,
      planType: fixedSub?.plan.type ?? null,
    };
  });
}

export async function bookSeat(params: {
  userId: string;
  seatId: string;
  date: Date;
  type: BookingType;
  subscriptionId?: string;
}) {
  const { userId, seatId, date, type, subscriptionId } = params;
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const seat = await prisma.seat.findUnique({
    where: { id: seatId },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE', endDate: { gte: new Date() } },
        include: { plan: true, user: true },
      },
    },
  });

  if (!seat) throw new Error('Seat not found');
  if (seat.status === 'MAINTENANCE') throw new Error('Seat is under maintenance');

  const existingBookings = await prisma.booking.findMany({
    where: {
      seatId,
      date: { gte: dayStart, lte: dayEnd },
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
    include: { user: true, seat: true },
  });

  const fixedSub = seat.subscriptions.find((s) => s.plan.type === 'FIXED');

  if (type === 'FIXED') {
    if (fixedSub && fixedSub.userId !== userId) {
      await prisma.bookingConflict.create({
        data: {
          seatId,
          seatNumber: seat.number,
          userId1: fixedSub.userId,
          userId2: userId,
          userName1: fixedSub.user.name,
          userName2: (await prisma.user.findUnique({ where: { id: userId } }))!.name,
          date: dayStart,
        },
      });
      throw new Error('SEAT_CONFLICT: This seat is already assigned to another student');
    }
    if (existingBookings.some((b) => b.userId !== userId)) {
      const other = existingBookings.find((b) => b.userId !== userId)!;
      await prisma.bookingConflict.create({
        data: {
          seatId,
          seatNumber: seat.number,
          userId1: other.userId,
          userId2: userId,
          userName1: other.user.name,
          userName2: (await prisma.user.findUnique({ where: { id: userId } }))!.name,
          date: dayStart,
        },
      });
      throw new Error('SEAT_CONFLICT: Another booking exists for this seat');
    }
  } else {
    if (fixedSub) {
      throw new Error('This is a fixed seat reserved for another student');
    }
    if (existingBookings.length > 0) {
      const other = existingBookings[0];
      if (other.userId !== userId) {
        await prisma.bookingConflict.create({
          data: {
            seatId,
            seatNumber: seat.number,
            userId1: other.userId,
            userId2: userId,
            userName1: other.user.name,
            userName2: (await prisma.user.findUnique({ where: { id: userId } }))!.name,
            date: dayStart,
          },
        });
        throw new Error('SEAT_CONFLICT: Seat already booked for this date');
      }
      return other;
    }
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      seatId,
      date: dayStart,
      type,
      subscriptionId,
      status: 'CONFIRMED',
    },
    include: {
      seat: true,
      user: { select: { id: true, name: true, photo: true } },
    },
  });

  if (type === 'FIXED') {
    await prisma.seat.update({
      where: { id: seatId },
      data: { status: 'BOOKED', assignedToId: userId },
    });
  } else {
    const isToday = dayStart.toDateString() === new Date().toDateString();
    if (isToday) {
      await prisma.seat.update({
        where: { id: seatId },
        data: { status: 'OCCUPIED_TODAY' },
      });
    }
  }

  return booking;
}
