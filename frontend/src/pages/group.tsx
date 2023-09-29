import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import axios from "axios";

interface Task {
  id: number;
  name: string;
  done: boolean;
}

export default function Page() {
  const { groupId } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const newTaskRef = useRef<HTMLInputElement>(null);

  const [tasks, setTasks] = useState<Array<Task>>([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/groups/" + groupId, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((data) => {
        setGroupName(data.data.name);
      })
      .catch((e) => {
        setError(e);
      });
    axios
      .get("http://localhost:3000/tasks/" + groupId, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((data) => {
        setTasks(data.data as Task[]);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [groupId]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    throw <h1>{error}</h1>;
  }

  async function handleTaskCheck(id: number) {
    const { data } = await axios.put(
      "http://localhost:3000/tasks/check",
      {
        taskId: id,
      },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    const copyTasks = tasks.map((task) => {
      console.log(task.id == data.id);
      if (task.id == data.id) {
        return { ...task, done: data.done };
      }
      return task;
    });
    setTasks(copyTasks);
  }

  async function handleTaskAdd() {
    if (newTaskRef.current) {
      const { data } = await axios.post(
        "http://localhost:3000/tasks/add",
        {
          name: newTaskRef.current.value,
          groupId: groupId,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setTasks([
        ...tasks,
        {
          id: data.id,
          name: data.name,
          done: data.done,
        },
      ]);
      newTaskRef.current.value = "";
    }
  }

  async function handleTaskDelete(id: number) {
    const { data } = await axios.delete("http://localhost:3000/tasks/delete", {
      data: {
        id: id,
      },
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    const copyTasks = tasks.filter((task) => task.id != data.id);
    setTasks(copyTasks);
  }

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col items-center">
      <div className="w-[28rem] h-full relative">
        <h1 className="text-5xl font-semibold pt-12 pb-10">{groupName}</h1>
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
