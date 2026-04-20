import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid'; // I need to install uuid

export const createClass = async (req: AuthRequest, res: Response) => {
  const { name, subject } = req.body;
  const userId = req.user.id;

  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return res.status(403).json({ error: 'Only teachers can create classes' });

    const classCode = uuidv4().substring(0, 6).toUpperCase();

    const newClass = await prisma.class.create({
      data: {
        name,
        subject,
        classCode,
        teacherId: teacher.id,
      },
    });

    res.status(201).json(newClass);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeacherClasses = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: { classes: true }
    });
    res.json(teacher?.classes || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getClassDetails = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          include: { user: true }
        },
        sessions: true
      }
    });

    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeacherStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const classes = await prisma.class.findMany({
      where: { teacherId: teacher.id },
      include: {
        _count: {
          select: { students: true }
        },
        sessions: {
          include: {
            records: true
          }
        }
      }
    });

    const totalStudents = classes.reduce((acc, c) => acc + c._count.students, 0);
    
    // Simple attendance calculation
    let totalPresent = 0;
    let totalRecords = 0;

    classes.forEach(c => {
      c.sessions.forEach(s => {
        s.records.forEach(r => {
          totalRecords++;
          if (r.status === 'PRESENT') totalPresent++;
        });
      });
    });

    const attendanceRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    res.json({
      totalStudents,
      attendanceRate: Math.round(attendanceRate),
      totalPresent,
      totalAbsent: totalRecords - totalPresent
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
