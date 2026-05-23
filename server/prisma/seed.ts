import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@libraryhub.com' },
    update: {},
    create: {
      email: 'admin@libraryhub.com',
      password: adminPassword,
      name: 'Library Admin',
      phone: '9999999999',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      password: studentPassword,
      name: 'Rahul Sharma',
      phone: '9876543210',
      collegeId: 'COL2024001',
      role: 'STUDENT',
      emailVerified: true,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    },
  });

  const plans = [
    {
      name: 'Fixed Seat',
      type: 'FIXED' as const,
      price: 4500,
      durationDays: 30,
      description: 'Your own dedicated cubicle, reserved 24/7',
      features: JSON.stringify([
        'Dedicated cubicle',
        'Power outlet & lamp',
        'Locker access',
        'Priority Wi-Fi',
      ]),
    },
    {
      name: 'Rotational Seat',
      type: 'ROTATIONAL' as const,
      price: 2500,
      durationDays: 30,
      description: 'First-come, first-served — pick any open seat',
      features: JSON.stringify([
        'Any available seat',
        'Flexible timing',
        'Common area access',
        'Standard Wi-Fi',
      ]),
    },
    {
      name: 'Day Pass',
      type: 'DAY_PASS' as const,
      price: 150,
      durationDays: 1,
      description: 'Single day access for exam prep',
      features: JSON.stringify(['One day access', 'Rotational seating', '9 AM - 10 PM']),
    },
    {
      name: 'Student Combo 3M',
      type: 'COMBO_3M' as const,
      price: 6500,
      durationDays: 90,
      description: '3 months rotational — save 15%',
      features: JSON.stringify(['3 month access', 'Rotational', '15% savings']),
    },
    {
      name: 'Student Combo 6M',
      type: 'COMBO_6M' as const,
      price: 12000,
      durationDays: 180,
      description: '6 months fixed — save 20%',
      features: JSON.stringify(['6 month access', 'Fixed seat', '20% savings', 'Free locker']),
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!existing) await prisma.plan.create({ data: plan });
  }

  const existingSeats = await prisma.seat.count();
  if (existingSeats === 0) {
    const seats: { number: string; row: number; col: number }[] = [];
    let num = 1;
    for (let row = 1; row <= 5; row++) {
      for (let col = 1; col <= 8; col++) {
        seats.push({
          number: `A${String(num).padStart(2, '0')}`,
          row,
          col,
        });
        num++;
      }
    }
    await prisma.seat.createMany({ data: seats });
    console.log(`Created ${seats.length} seats`);
  }

  const student = await prisma.user.findUnique({ where: { email: 'student@demo.com' } });
  const fixedPlan = await prisma.plan.findFirst({ where: { type: 'FIXED' } });
  const seat = await prisma.seat.findFirst({ where: { number: 'A01' } });

  if (student && fixedPlan && seat) {
    const existing = await prisma.subscription.findFirst({
      where: { userId: student.id, status: 'ACTIVE' },
    });
    if (!existing) {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 30);

      const sub = await prisma.subscription.create({
        data: {
          userId: student.id,
          planId: fixedPlan.id,
          seatId: seat.id,
          startDate: start,
          endDate: end,
          status: 'ACTIVE',
        },
      });

      await prisma.seat.update({
        where: { id: seat.id },
        data: { status: 'BOOKED', assignedToId: student.id },
      });

      await prisma.payment.create({
        data: {
          userId: student.id,
          subscriptionId: sub.id,
          amount: fixedPlan.price,
          status: 'PAID',
          dueDate: start,
          paidAt: start,
          invoiceNumber: `INV-DEMO-001`,
          paymentMethod: 'cash',
        },
      });

      for (let i = 0; i < 5; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        await prisma.checkIn.create({
          data: { userId: student.id, seatId: seat.id, checkedAt: d },
        });
      }
    }
  }

  console.log('Seed complete!');
  console.log('Admin: admin@libraryhub.com / admin123');
  console.log('Student: student@demo.com / student123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
