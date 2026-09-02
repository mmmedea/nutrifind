import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

const DEMO_USER_EMAIL = "demo@example.com";

export async function getRecentSearches(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    });

    if (!user) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const searches = await prisma.recentSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    res.json({ searches });
  } catch (error) {
    next(error);
  }
}
