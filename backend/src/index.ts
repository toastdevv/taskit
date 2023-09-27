import * as dotenv from "dotenv";
dotenv.config();
import type { NextFunction, Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const app = express();

const prisma = new PrismaClient();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
  })
);
app.use(bodyParser.json());

type token = {
  id: string;
  time: number;
};

interface CustomRequest extends Request {
  user: User;
}

async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Authorization token missing.");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as Secret
    ) as token;

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
      },
    });

    if (user) {
      const reqUser = JSON.parse(JSON.stringify(user));
      delete reqUser.password;
      (req as CustomRequest).user = reqUser;
      next();
    } else {
      throw new Error("User invalid.");
    }
  } catch (e) {
    res.json({
      error: e,
    });
  }
}

app.post("/signup", async (req: Request, res: Response) => {
  const body = req.body;
  const user = await prisma.user.findFirst({
    where: {
      email: body.email,
    },
  });
  if (user) {
    res.json({
      error: "User already exists.",
    });
  } else {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        password: bcrypt.hashSync(body.password, 12),
      },
    });

    res.json({
      token: jwt.sign(
        {
          id: user.id,
          time: Date.now(),
        },
        process.env.JWT_SECRET as Secret
      ),
    });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  const body = req.body;
  const user = await prisma.user.findFirst({
    where: {
      email: body.email,
    },
  });
  if (user) {
    if (bcrypt.compareSync(body.password, user.password)) {
      res.json({
        token: jwt.sign(
          {
            id: user?.id,
            time: Date.now(),
          },
          process.env.JWT_SECRET as Secret
        ),
      });
    } else {
      res.json({
        error: "Incorrect password.",
      });
    }
  } else {
    res.json({
      error: "User not found.",
    });
  }
});

app.get("/user", auth, async (req: CustomRequest, res: Response) => {
  res.json(req.user);
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000/");
});
