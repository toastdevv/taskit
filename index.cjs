require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ViteExpress = require("vite-express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

if (process.env.NODE_ENV == "development") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", "'unsafe-inline'"],
          "connect-src": "*",
        },
      },
    })
  );
} else {
  app.use(helmet());
}

async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json("Authorization token missing.");
      res.end();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
      },
    });

    if (user) {
      const reqUser = JSON.parse(JSON.stringify(user));
      delete reqUser.password;
      req.user = reqUser;
      next();
    } else {
      res.status(401).json("User invalid.");
    }
  } catch (e) {
    console.log(e);
    res.json({
      error: "Something went wrong.",
    });
  }
}

const api = express.Router();

api.post("/signup", async (req, res) => {
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
          password: bcrypt.hashSync(body.password, 12),
        },
      });

      const token = jwt.sign(
        {
          id: user.id,
          time: Date.now(),
        },
        process.env.JWT_SECRET
      );

      const welcomeGroup = await prisma.group.create({
        data: {
          name: "Welcome",
          userId: user.id,
        },
      });

      const setupQueries = [
        prisma.group.create({
          data: {
            name: "You can also delete me!",
            userId: user.id,
          },
        }),
        prisma.task.create({
          data: {
            name: "Welcome to my humble task management app!",
            groupId: welcomeGroup.id,
            userId: user.id,
          },
        }),
        prisma.task.create({
          data: {
            name: "Try deleting me!",
            groupId: welcomeGroup.id,
            userId: user.id,
          },
        }),
        prisma.task.create({
          data: {
            name: "You can also create and check tasks to stay organized.",
            groupId: welcomeGroup.id,
            userId: user.id,
            done: true,
          },
        }),
      ];

      await prisma.$transaction(setupQueries);

      res.json({
        token: token,
      });
    }
  } catch (e) {
    res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

api.post("/login", async (req, res) => {
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
            process.env.JWT_SECRET
          ),
        });
      } else {
        res.status(401).json({
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
      error: "Something went wrong.",
    });
  }
});

api.get("/user", auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (e) {
    res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

api.get("/groups", auth, async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.json(groups);
  } catch (e) {
    res.status(500).send({
      error: "Something went wrong.",
    });
  }
});

api.get("/groups/:id", auth, async (req, res) => {
  try {
    const group = await prisma.group.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });
    res.json(group);
  } catch (e) {
    res.status(500).send({
      error: "Something went wrong.",
    });
  }
});

api.post("/groups", auth, async (req, res) => {
  try {
    const group = await prisma.group.create({
      data: {
        userId: req.user.id,
        name: req.body.name,
      },
    });
    res.json(group);
  } catch (e) {
    res.status(500).send({
      error: "Something went wrong.",
    });
  }
});

api.delete("/groups/:id", auth, async (req, res) => {
  try {
    const group = await prisma.group.delete({
      where: {
        id: req.params.id,
      },
    });
    res.json(group);
  } catch (e) {
    res.status(500).send({
      error: "Something went wrong.",
    });
  }
});

api.get("/tasks/:id", auth, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.id,
        groupId: req.params.id,
      },
    });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

api.post("/tasks", auth, async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: {
        userId: req.user.id,
        name: req.body.name,
        groupId: req.body.groupId,
      },
    });
    res.json(task);
  } catch (e) {
    res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

api.put("/tasks", auth, async (req, res) => {
  try {
    const prevTask = await prisma.task.findFirst({
      where: {
        id: req.body.id,
        userId: req.user.id,
      },
    });
    if (!prevTask) {
      res.send("No task was found by this id.");
      return;
    }
    const task = await prisma.task.update({
      where: {
        id: req.body.id,
        userId: req.user.id,
      },
      data: {
        done: !prevTask?.done,
      },
    });
    res.json(task);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

api.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await prisma.task.delete({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });
    res.json(task);
  } catch (e) {
    res.status(500).json({
      error: "Something went wrong.",
    });
  }
});

app.use("/api", api);

ViteExpress.listen(app, PORT, () => {
  console.log("Listening on http://localhost:" + PORT + "/");
});
