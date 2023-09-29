import * as dotenv from "dotenv";
dotenv.config();
import type { NextFunction, Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";

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
    console.log(e);
    res.json({
      error: (e as Error).message,
    });
  }
}

app.post("/signup", async (req: Request, res: Response) => {
  try {
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
  } catch (e) {
    res.status(500).json({
      erro: "Something went wrong.",
    });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
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
  } catch (e) {
    res.status(500).json({
      erro: "Something went wrong.",
    });
  }
});

app.get("/user", auth, async (req: CustomRequest, res: Response) => {
  try {
    res.json(req.user);
  } catch (e) {
    res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

app.get("/groups", auth, async (req: CustomRequest, res: Response) => {
  const groups = await prisma.group.findMany({
    where: {
      userId: req.user.id,
    },
  });
  res.json(groups);
});

app.get("/groups/:groupId", auth, async (req: CustomRequest, res: Response) => {
  const group = await prisma.group.findFirst({
    where: {
      id: req.params.groupId,
      userId: req.user.id,
    },
  });
  res.json(group);
});

app.post("/groups/add", auth, async (req: CustomRequest, res: Response) => {
  const group = await prisma.group.create({
    data: {
      userId: req.user.id,
      name: req.body.name,
    },
  });
  res.json(group);
});

app.delete(
  "/groups/delete/:groupId",
  auth,
  async (req: CustomRequest, res: Response) => {
    const group = await prisma.group.delete({
      where: {
        id: req.params.groupId,
      },
    });
    res.json(group);
  }
);

app.get("/tasks/:groupId", auth, async (req: CustomRequest, res: Response) => {
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
      groupId: req.params.groupId,
    },
  });
  res.json(tasks);
});

app.post("/tasks/add", auth, async (req: CustomRequest, res: Response) => {
  const task = await prisma.task.create({
    data: {
      userId: req.user.id,
      name: req.body.name,
      groupId: req.body.groupId,
    },
  });
  res.json(task);
});

app.put("/tasks/check", auth, async (req: CustomRequest, res: Response) => {
  const prevTask = await prisma.task.findFirst({
    where: {
      id: req.body.roomId,
      userId: req.user.id,
    },
  });
  if (!prevTask) {
    res.send("No task was found by this id.");
  }
  const task = await prisma.task.update({
    where: {
      id: req.body.taskId,
      userId: req.user.id,
    },
    data: {
      done: !prevTask?.done,
    },
  });
  res.json(task);
});

app.delete("/tasks/delete", auth, async (req: CustomRequest, res: Response) => {
  const task = await prisma.task.delete({
    where: {
      id: req.body.id,
      userId: req.user.id,
    },
  });
  res.json(task);
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000/");
});
