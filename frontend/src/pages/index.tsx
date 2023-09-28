import { useEffect, useRef, useState } from "react";
import auth from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";

// interface UserData {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

interface Task {
  id: number;
  name: string;
  done: boolean;
}

interface Group {
  id: number;
  name: string;
}

// TODO: Adding and removing tasks and groups API integration

export default function Page() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const newTaskRef = useRef<HTMLInputElement>(null);
  const newGroupRef = useRef<HTMLInputElement>(null);

  const [groups, setGroups] = useState<Array<Group>>([
    {
      id: 1,
      name: "Daily",
    },
    {
      id: 2,
      name: "Weekly",
    },
    {
      id: 3,
      name: "Groceries",
    },
  ]);

  const [tasks, setTasks] = useState<Array<Task>>([
    {
      id: 1,
      name: "Take a walk",
      done: false,
    },
    {
      id: 2,
      name: "Brush my teeth",
      done: false,
    },
    {
      id: 3,
      name: "Buy groceries",
      done: false,
    },
    {
      id: 4,
      name: "Watch TV",
      done: true,
    },
    {
      id: 5,
      name: "Call Mom",
      done: true,
    },
    {
      id: 6,
      name: "Do homework",
      done: true,
    },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    auth()
      .then((data) => {
        if (!data) {
          navigate("/login");
        }
        setData(data);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    console.log(tasks);
  }, [tasks]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    console.log(error);
    throw <h1>{error}</h1>;
  }

  function handleTaskCheck(id: number) {
    const copyTasks = tasks.map((task) => {
      if (task.id == id) {
        return { ...task, done: !task.done };
      }
      return task;
    });
    setTasks(copyTasks);
  }

  function handleTaskAdd() {
    if (newTaskRef.current) {
      setTasks([
        ...tasks,
        {
          id:
            tasks.length > 0
              ? Math.max(...tasks.map((task) => task.id)) + 1
              : 1,
          name: newTaskRef.current.value,
          done: false,
        },
      ]);
      newTaskRef.current.value = "";
    }
  }

  function handleTaskDelete(id: number) {
    const copyTasks = tasks.filter((task) => task.id != id);
    setTasks(copyTasks);
  }

  function handleGroupAdd() {
    if (newGroupRef.current) {
      setGroups([
        ...groups,
        {
          id:
            groups.length > 0
              ? Math.max(...groups.map((group) => group.id)) + 1
              : 1,
          name: newGroupRef.current.value,
        },
      ]);
      newGroupRef.current.value = "";
    }
  }

  function handleGroupDelete(id: number) {
    const copyGroups = groups.filter((groups) => groups.id != id);
    setGroups(copyGroups);
  }

  if (data) {
    // const user = data as UserData;

    return (
      <div className="h-screen w-screen flex flex-row">
        <div className="h-full w-96 bg-gray-200 flex-shrink-0 border-r-gray-500 border-r-2 relative">
          <div className="px-8">
            <h1 className="text-3xl font-semibold pt-8 pb-5">Task Groups</h1>
            {groups.map((group) => (
              <Group
                key={group.id}
                id={group.id}
                name={group.name}
                onDelete={handleGroupDelete}
              />
            ))}
          </div>
          <div className="absolute bottom-0 w-full flex flex-row items-center justify-evenly py-2">
            <input
              type="text"
              placeholder="Add a new tasks group"
              className="border-2 border-black p-1"
              ref={newGroupRef}
            />
            <button
              type="submit"
              className="underline hover:no-underline"
              onClick={handleGroupAdd}
            >
              Add
            </button>
          </div>
        </div>
        <div className="h-full w-full bg-gray-50 flex flex-col items-center">
          <div className="w-[28rem] h-full relative">
            <h1 className="text-5xl font-semibold pt-12 pb-10">Daily</h1>
            {tasks
              .filter((task) => !task.done)
              .map((task) => (
                <Task
                  key={task.id}
                  id={task.id}
                  name={task.name}
                  onCheck={handleTaskCheck}
                  onDelete={handleTaskDelete}
                />
              ))}
            <h1 className="text-xl font-semibold py-4 text-black text-opacity-50">
              Finished
            </h1>
            {tasks
              .filter((task) => task.done)
              .map((task) => (
                <Task
                  key={task.id}
                  id={task.id}
                  name={task.name}
                  done
                  onCheck={handleTaskCheck}
                  onDelete={handleTaskDelete}
                />
              ))}
            <div className="absolute bottom-0 w-full flex flex-row items-center justify-evenly py-2">
              <input
                type="text"
                placeholder="Add a new task"
                className="border-2 border-black p-1"
                ref={newTaskRef}
              />
              <button
                type="submit"
                className="underline hover:no-underline"
                onClick={handleTaskAdd}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function Group({
  id,
  name,
  onDelete,
}: {
  id: number;
  name: string;
  onDelete: (id: number) => void;
}) {
  function handleTaskDelete() {
    onDelete(id);
  }
  return (
    <Link
      to="/"
      className="h-12 px-4 my-4 w-full bg-black bg-opacity-5 drop-shadow-lg hover:bg-opacity-10 rounded-lg flex items-center justify-between group"
    >
      <h1 className="text-xl font-medium py-6">{name}</h1>
      <button className="text-xl" onClick={handleTaskDelete}>
        <IoClose className="text-2xl text-black text-opacity-0 hover:bg-black hover:bg-opacity-10 group-hover:text-opacity-70 rounded-lg" />
      </button>
    </Link>
  );
}

function Task({
  id,
  name,
  done,
  onCheck,
  onDelete,
}: {
  id: number;
  name: string;
  done?: boolean;
  onCheck: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  function handleTaskCheck() {
    onCheck(id);
  }

  function handleTaskDelete() {
    onDelete(id);
  }

  return (
    <div className="flex flex-row items-center justify-between w-full py-2 hover:bg-black hover:bg-opacity-5 p-2 rounded-md group">
      <div className="flex flex-row items-center">
        <input
          type="checkbox"
          className="h-5 w-5 cursor-pointer"
          defaultChecked={done && true}
          onClick={handleTaskCheck}
        />
        <h1
          className={`pl-4 text-xl cursor-default  ${
            done && "line-through text-black text-opacity-40"
          }`}
        >
          {name}
        </h1>
      </div>
      <button className="text-xl" onClick={handleTaskDelete}>
        <IoClose className="text-2xl text-black text-opacity-0 hover:bg-black hover:bg-opacity-10 group-hover:text-opacity-70 rounded-lg" />
      </button>
    </div>
  );
}
